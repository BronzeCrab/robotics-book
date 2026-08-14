<script setup lang="ts">
import { computed } from "vue";
import { TresCanvas } from "@tresjs/core";
import { GLTFModel, OrbitControls } from "@tresjs/cientos";
import { resolveMediaUrl } from "../../lib/media";

const props = defineProps<{
  src: string;
  draco?: boolean;
}>();

const path = computed(() => resolveMediaUrl(props.src, "models"));
</script>

<template>
  <div class="model3d">
    <TresCanvas clear-color="#f4f4f5">
      <TresPerspectiveCamera :position="[2.4, 1.8, 2.4]" />
      <OrbitControls make-default />
      <TresAmbientLight :intensity="0.7" />
      <TresDirectionalLight :position="[4, 8, 4]" :intensity="1.3" cast-shadow />
      <TresGridHelper :args="[4, 8, '#d4d4d8', '#e4e4e7']" />
      <Suspense>
        <GLTFModel :path="path" :draco="draco" />
      </Suspense>
    </TresCanvas>
  </div>
</template>
