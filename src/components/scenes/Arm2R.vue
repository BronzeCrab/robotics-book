<script setup lang="ts">
import { computed, ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";

const l1 = 1.6;
const l2 = 1.2;
const q1Deg = ref(38);
const q2Deg = ref(48);
const q1 = computed(() => (q1Deg.value * Math.PI) / 180);
const q2 = computed(() => (q2Deg.value * Math.PI) / 180);
</script>

<template>
  <div class="arm2r">
    <div class="arm2r-canvas">
      <TresCanvas clear-color="#f4f4f5">
        <TresPerspectiveCamera :position="[2.8, 1.8, 4.2]" />
        <OrbitControls make-default :target="[0.8, 0.7, 0]" />
        <TresAmbientLight :intensity="0.75" />
        <TresDirectionalLight :position="[4, 6, 3]" :intensity="1.25" />
        <TresGridHelper :args="[6, 12, '#d4d4d8', '#e4e4e7']" />
        <TresAxesHelper :args="[0.8]" />

        <TresMesh>
          <TresSphereGeometry :args="[0.1, 20, 20]" />
          <TresMeshStandardMaterial color="#18181b" />
        </TresMesh>

        <TresGroup :rotation="[0, 0, q1 - Math.PI / 2]">
          <TresMesh :position="[0, l1 / 2, 0]">
            <TresCylinderGeometry :args="[0.07, 0.07, l1, 18]" />
            <TresMeshStandardMaterial color="#2563eb" />
          </TresMesh>
          <TresMesh :position="[0, l1, 0]">
            <TresSphereGeometry :args="[0.09, 20, 20]" />
            <TresMeshStandardMaterial color="#f4f4f5" />
          </TresMesh>

          <TresGroup :position="[0, l1, 0]" :rotation="[0, 0, q2]">
            <TresMesh :position="[0, l2 / 2, 0]">
              <TresCylinderGeometry :args="[0.06, 0.06, l2, 18]" />
              <TresMeshStandardMaterial color="#0f766e" />
            </TresMesh>
            <TresMesh :position="[0, l2, 0]">
              <TresSphereGeometry :args="[0.1, 20, 20]" />
              <TresMeshStandardMaterial color="#0f766e" />
            </TresMesh>
          </TresGroup>
        </TresGroup>
      </TresCanvas>
    </div>
    <div class="arm2r-controls">
      <label>
        <span>q₁ = {{ q1Deg }}°</span>
        <input v-model.number="q1Deg" type="range" min="-160" max="160" step="1" />
      </label>
      <label>
        <span>q₂ = {{ q2Deg }}°</span>
        <input v-model.number="q2Deg" type="range" min="-150" max="150" step="1" />
      </label>
    </div>
  </div>
</template>
