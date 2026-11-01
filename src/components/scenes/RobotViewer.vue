<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from "vue";
import { TresCanvas } from "@tresjs/core";
import { Html, OrbitControls } from "@tresjs/cientos";
import { Box3, Group, Vector3 } from "three";
import URDFLoader from "urdf-loader";
import { resolveMediaUrl } from "../../lib/media";

interface Props {
  /** Path to a .urdf file inside public/models or a full URL. */
  src: string;
  /** Optional display names for links and joints, keyed by URDF name. */
  labels?: Record<string, string>;
  /** Optional starting pose. Revolute joints are in degrees, prismatic in metres. */
  pose?: Record<string, number>;
  /** Show link names as floating labels. */
  showLabels?: boolean;
  background?: string;
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => ({}),
  pose: () => ({}),
  showLabels: true,
  background: "#f4f4f5",
});

type JointControl = {
  name: string;
  label: string;
  type: "revolute" | "continuous" | "prismatic";
  min: number;
  max: number;
  step: number;
  value: number;
  initial: number;
  unit: string;
};

type LabelEntry = {
  key: string;
  text: string;
  position: [number, number, number];
};

type LinkRef = {
  link: any;
  text: string;
};

const root = new Group();
const robot = shallowRef<any>(null);
const loading = ref(true);
const error = ref("");
const showLabelHints = ref(props.showLabels);
const cameraPosition = ref<[number, number, number]>([2.6, 1.9, 3.2]);
const controlsTarget = ref<[number, number, number]>([0, 0.6, 0]);
const gridSize = ref(6);
const canvasEl = ref<HTMLElement | null>(null);
const joints = ref<JointControl[]>([]);
const labelEntries = ref<LabelEntry[]>([]);
const linkRefs: LinkRef[] = [];

const locale = ref<"ru" | "en">("ru");
const text = computed(() =>
  locale.value === "en"
    ? {
        loading: "Loading model…",
        reset: "Reset pose",
        labels: "Labels",
        empty: "This URDF has no movable joints.",
      }
    : {
        loading: "Загрузка модели…",
        reset: "Сбросить позу",
        labels: "Подписи",
        empty: "В этом URDF нет подвижных суставов.",
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
    const loader = new URDFLoader();
    const model = await loader.loadAsync(url);

    // URDF is Z-up; Three.js scenes are Y-up.
    model.rotation.x = -Math.PI / 2;
    root.add(model);
    robot.value = model;

    fit(model);

    buildJoints(model);
    buildLabels(model);
    updateLabels();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function fit(model: any) {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) {
    void model;
    return;
  }

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
  const targetY = Math.max(height / 2, 0.12);
  controlsTarget.value = [0, targetY, 0];
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

function buildJoints(model: any) {
  const controls: JointControl[] = [];

  for (const joint of Object.values<any>(model.joints ?? {})) {
    const type = joint.jointType;
    if (type !== "revolute" && type !== "continuous" && type !== "prismatic") {
      continue;
    }

    const revolute = type !== "prismatic";
    let min = revolute ? -Math.PI : -0.5;
    let max = revolute ? Math.PI : 0.5;

    if (type !== "continuous") {
      const lower = Number(joint.limit?.lower ?? 0);
      const upper = Number(joint.limit?.upper ?? 0);
      if (Number.isFinite(lower) && Number.isFinite(upper) && upper > lower) {
        min = lower;
        max = upper;
      }
    }

    const minValue = revolute ? Math.round((min * 180) / Math.PI) : Number(min.toFixed(3));
    const maxValue = revolute ? Math.round((max * 180) / Math.PI) : Number(max.toFixed(3));
    const requested = Number(props.pose[joint.name] ?? 0);
    const initial = Math.min(
      maxValue,
      Math.max(minValue, Number.isFinite(requested) ? requested : 0),
    );
    joint.setJointValue(revolute ? (initial * Math.PI) / 180 : initial);

    controls.push({
      name: joint.name,
      label: props.labels[joint.name] ?? joint.name.replaceAll("_", " "),
      type: type === "continuous" ? "continuous" : revolute ? "revolute" : "prismatic",
      min: minValue,
      max: maxValue,
      step: revolute ? 1 : 0.005,
      value: initial,
      initial,
      unit: revolute ? "°" : "m",
    });
  }

  joints.value = controls;
}

function buildLabels(model: any) {
  linkRefs.length = 0;
  const entries: LabelEntry[] = [];

  for (const link of Object.values<any>(model.links ?? {})) {
    const hasVisual = link.children.some((child: any) => child.isURDFVisual);
    if (!hasVisual) continue;

    const name = String(link.name);
    const label = props.labels[name] ?? name.replaceAll("_", " ");
    linkRefs.push({ link, text: label });
    entries.push({ key: name, text: label, position: [0, 0, 0] });
  }

  labelEntries.value = entries;
}

function updateLabels() {
  if (!robot.value) return;

  root.updateMatrixWorld(true);
  const point = new Vector3();

  labelEntries.value.forEach((entry, index) => {
    const ref = linkRefs[index];
    if (!ref) return;

    const box = new Box3();
    let hasVisual = false;
    for (const child of ref.link.children) {
      if (child.isURDFVisual) {
        box.expandByObject(child);
        hasVisual = true;
      }
    }

    if (hasVisual && !box.isEmpty()) {
      box.getCenter(point);
    } else {
      ref.link.getWorldPosition(point);
    }

    entry.position = [point.x, point.y + 0.06, point.z];
  });
}

function setJoint(joint: JointControl, event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  joint.value = value;

  const raw = joint.type === "prismatic" ? value : (value * Math.PI) / 180;
  robot.value?.setJointValue(joint.name, raw);
  updateLabels();
}

function resetPose() {
  for (const joint of joints.value) {
    joint.value = joint.initial;
    const raw =
      joint.type === "prismatic"
        ? joint.initial
        : (joint.initial * Math.PI) / 180;
    robot.value?.setJointValue(joint.name, raw);
  }
  updateLabels();
}

function formatValue(joint: JointControl) {
  return joint.type === "prismatic"
    ? `${joint.value.toFixed(3)} ${joint.unit}`
    : `${joint.value.toFixed(0)}${joint.unit}`;
}
</script>

<template>
  <div class="robot-viewer">
    <div ref="canvasEl" class="robot-viewer-canvas">
      <TresCanvas :clear-color="background">
        <TresPerspectiveCamera :position="cameraPosition" :fov="45" />
        <OrbitControls
          make-default
          :target="controlsTarget"
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
      <p v-else-if="error" class="robot-viewer-error">{{ error }}</p>
    </div>

    <div class="robot-viewer-controls">
      <p v-if="!joints.length && !loading && !error" class="robot-viewer-empty">
        {{ text.empty }}
      </p>
      <label v-for="joint in joints" :key="joint.name">
        <span>{{ joint.label }} = {{ formatValue(joint) }}</span>
        <input
          type="range"
          :min="joint.min"
          :max="joint.max"
          :step="joint.step"
          :value="joint.value"
          @input="setJoint(joint, $event)"
        />
      </label>
      <div class="robot-viewer-actions">
        <label class="robot-viewer-check">
          <input v-model="showLabelHints" type="checkbox" />
          {{ text.labels }}
        </label>
        <button type="button" :disabled="!joints.length" @click="resetPose">
          {{ text.reset }}
        </button>
      </div>
    </div>
  </div>
</template>
