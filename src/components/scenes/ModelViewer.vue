<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { Html, OrbitControls } from "@tresjs/cientos";
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { resolveMediaUrl } from "../../lib/media";

interface Props {
  /** Path inside public/models or a full URL. Supports glb, gltf, obj, stl, 3mf. */
  src: string;
  labels?: Record<string, string>;
  showLabels?: boolean;
  background?: string;
  autoRotate?: boolean;
  /** Axis the file uses. "auto" treats CAD meshes as Z-up and glTF as Y-up. */
  up?: "auto" | "y" | "z";
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => ({}),
  showLabels: true,
  background: "#f4f4f5",
  autoRotate: false,
  up: "auto",
});

type PartRef = {
  object: Object3D;
  original: Vector3;
  text: string;
};

type LabelEntry = {
  key: string;
  text: string;
  position: [number, number, number];
};

const root = new Group();
const loading = ref(true);
const error = ref("");
const showLabelHints = ref(props.showLabels);
const explode = ref(0);
const cameraPosition = ref<[number, number, number]>([2.6, 1.9, 3.2]);
const controlsTarget = ref<[number, number, number]>([0, 0.6, 0]);
const gridSize = ref(6);
const canvasEl = ref<HTMLElement | null>(null);
const labelEntries = ref<LabelEntry[]>([]);
const parts: PartRef[] = [];

const locale = ref<"ru" | "en">("ru");
const text = computed(() =>
  locale.value === "en"
    ? {
        loading: "Loading model…",
        explode: "Exploded view",
        labels: "Labels",
        reset: "Reset view",
      }
    : {
        loading: "Загрузка модели…",
        explode: "Разнести части",
        labels: "Подписи",
        reset: "Сбросить вид",
      },
);

const visibleLabels = computed(() =>
  showLabelHints.value ? labelEntries.value : [],
);

onMounted(() => {
  const lang = document.documentElement.lang?.toLowerCase() ?? "ru";
  locale.value = lang.startsWith("en") ? "en" : "ru";
  void load();
});

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const url = resolveMediaUrl(props.src, "models");
    const extension = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    const object = await loadObject(url, extension);

    if (isUpZ(extension)) {
      object.rotation.x = -Math.PI / 2;
    }

    root.add(object);
    fit();

    collectParts(object);
    buildLabels();
    applyExplode();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function loadObject(url: string, extension: string): Promise<Object3D> {
  if (extension === "glb" || extension === "gltf") {
    return (await new GLTFLoader().loadAsync(url)).scene;
  }

  if (extension === "obj") {
    const object = await new OBJLoader().loadAsync(url);
    beautifyMaterials(object);
    return object;
  }

  if (extension === "stl") {
    const geometry = await new STLLoader().loadAsync(url);
    geometry.computeVertexNormals();
    return new Mesh(
      geometry,
      new MeshStandardMaterial({
        color: "#9aa4b2",
        metalness: 0.15,
        roughness: 0.55,
      }),
    );
  }

  if (extension === "3mf") {
    return await new ThreeMFLoader().loadAsync(url);
  }

  throw new Error(`Unsupported 3D format: .${extension || "?"}`);
}

function isUpZ(extension: string) {
  if (props.up !== "auto") return props.up === "z";
  return !(extension === "glb" || extension === "gltf");
}

function beautifyMaterials(object: Object3D) {
  object.traverse((child) => {
    if (!(child as Mesh).isMesh) return;
    const mesh = child as Mesh;
    if (!mesh.geometry.attributes.normal) {
      mesh.geometry.computeVertexNormals();
    }
    const material = mesh.material as any;
    if (material?.type === "MeshPhongMaterial") {
      mesh.material = new MeshStandardMaterial({
        color: material.color?.isColor ? material.color : "#b6bec9",
        metalness: 0.15,
        roughness: 0.55,
      });
    }
  });
}

function fit() {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) return;

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.2 / maxDim;

  root.scale.setScalar(scale);
  root.position.set(
    -center.x * scale,
    -box.min.y * scale,
    -center.z * scale,
  );
  root.updateMatrixWorld(true);

  const height = size.y * scale;
  controlsTarget.value = [0, height / 2, 0];
  gridSize.value = Math.max(2, Math.ceil(Math.max(size.x, size.z) * scale * 1.6));
  frame();
}

function frame() {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) return;

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const aspect = canvasAspect();
  const tanV = Math.tan((45 * Math.PI) / 360);
  const tanH = tanV * aspect;
  const distance =
    Math.max(size.y / 2 / tanV, size.x / 2 / tanH) * 1.3;
  const direction = new Vector3(2.3, 2, 2.8).normalize();

  controlsTarget.value = [center.x, center.y, center.z];
  cameraPosition.value = [
    center.x + direction.x * distance,
    center.y + direction.y * distance,
    center.z + direction.z * distance,
  ];
}

function canvasAspect() {
  const width = canvasEl.value?.clientWidth ?? 0;
  const height = canvasEl.value?.clientHeight ?? 0;
  return width > 0 && height > 0 ? width / height : 2.2;
}

function collectParts(object: Object3D) {
  parts.length = 0;

  let candidates = object.children;
  if (candidates.length === 0 && (object as Mesh).isMesh) {
    candidates = [object];
  }
  if (candidates.length < 2 && candidates.length === 1) {
    const only = candidates[0];
    if (only.children.length >= 2) candidates = only.children;
  }

  const usable = candidates.filter((child) => {
    let hasMesh = false;
    child.traverse((node) => {
      if ((node as Mesh).isMesh) hasMesh = true;
    });
    return hasMesh;
  });

  for (const [index, child] of usable.entries()) {
    const name = child.name || `part-${index + 1}`;
    parts.push({
      object: child,
      original: child.position.clone(),
      text: props.labels[name] ?? name.replaceAll(/[_-]/g, " "),
    });
    child.updateMatrixWorld(true);
  }
}

function buildLabels() {
  labelEntries.value = parts.map((part, index) => ({
    key: `${part.text}-${index}`,
    text: part.text,
    position: [0, 0, 0],
  }));
  updateLabels();
}

function applyExplode() {
  if (!parts.length) return;

  for (const part of parts) {
    part.object.position.copy(part.original);
  }
  root.updateMatrixWorld(true);

  const factor = explode.value / 100;
  if (factor <= 0) {
    updateLabels();
    frame();
    return;
  }

  const modelBox = new Box3().setFromObject(root);
  const modelCenter = modelBox.getCenter(new Vector3());
  const size = modelBox.getSize(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  const centers = parts.map((part) =>
    new Box3().setFromObject(part.object).getCenter(new Vector3()),
  );

  parts.forEach((part, index) => {
    const center = centers[index];
    const direction = center.clone().sub(modelCenter);
    if (direction.lengthSq() < 1e-8) return;

    direction.normalize().multiplyScalar(factor * maxDim * 0.55);
    const target = center.clone().add(direction);
    const parent = part.object.parent ?? root;
    part.object.position.copy(parent.worldToLocal(target));
  });

  root.updateMatrixWorld(true);
  updateLabels();
  frame();
}

function updateLabels() {
  if (!labelEntries.value.length) return;
  root.updateMatrixWorld(true);

  labelEntries.value.forEach((entry, index) => {
    const part = parts[index];
    if (!part) return;
    const center = new Box3()
      .setFromObject(part.object)
      .getCenter(new Vector3());
    entry.position = [center.x, center.y + 0.08, center.z];
  });
}

function resetView() {
  explode.value = 0;
  applyExplode();
}
</script>

<template>
  <div class="model-viewer">
    <div ref="canvasEl" class="model-viewer-canvas">
      <TresCanvas :clear-color="background">
        <TresPerspectiveCamera :position="cameraPosition" :fov="45" />
        <OrbitControls
          make-default
          :target="controlsTarget"
          :auto-rotate="autoRotate"
          :enable-damping="true"
        />
        <TresAmbientLight :intensity="0.85" />
        <TresDirectionalLight :position="[4, 7, 4]" :intensity="1.35" />
        <TresDirectionalLight :position="[-4, 3, -3]" :intensity="0.35" />
        <TresGridHelper :args="[gridSize, gridSize * 2, '#d4d4d8', '#e4e4e7']" />
        <primitive :object="root" />
        <Html
          v-for="label in visibleLabels"
          :key="label.key"
          :position="label.position"
          center
          wrapper-class="robot-label"
        >
          {{ label.text }}
        </Html>
      </TresCanvas>
      <p v-if="loading" class="book-scene-loading">{{ text.loading }}</p>
      <p v-else-if="error" class="model-viewer-error">{{ error }}</p>
    </div>

    <div class="model-viewer-controls">
      <label>
        <span>{{ text.explode }} = {{ explode }}%</span>
        <input
          v-model.number="explode"
          type="range"
          min="0"
          max="100"
          step="1"
          @input="applyExplode"
        />
      </label>
      <div class="model-viewer-actions">
        <label class="model-viewer-check">
          <input v-model="showLabelHints" type="checkbox" />
          {{ text.labels }}
        </label>
        <button type="button" @click="resetView">{{ text.reset }}</button>
      </div>
    </div>
  </div>
</template>
