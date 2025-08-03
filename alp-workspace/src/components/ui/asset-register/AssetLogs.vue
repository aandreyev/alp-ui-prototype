<template>
  <modal @close="$emit('close')" :headingTitle="'Asset Logs'">
    <modal-form @cancel="$emit('close')" confirmText="-1">
      <div class="overflow-y-auto" ref="container">
        <ul role="list" class="space-y-6 w-full pr-2">
          <li
            v-for="(activityItem, activityItemIdx) in items"
            :key="activityItem.assetId"
            class="relative flex gap-x-4"
          >
            <div
              :class="[
                activityItemIdx === items.length - 1 ? 'h-6' : '-bottom-6',
                'absolute left-0 top-0 flex w-6 justify-center',
              ]"
            >
              <div
                class="w-px bg-gray-200"
                v-if="
                  activityItem.assetActionType == 1 ||
                  activityItem.assetActionType == 2 ||
                  (activityItem.assetActionType == 3 &&
                    activityItem.asset.status !== 4) ||
                  (activityItem.assetActionType == 4 && activityItem.asset.status !== 5)
                "
              />
            </div>
            <template
              v-if="activityItem.assetActionType == 3 && activityItem.asset.status !== 4"
            >
              <div
                class="relative flex h-6 w-6 flex-none items-center justify-center bg-white"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <div class="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                <div class="flex justify-between gap-x-4">
                  <div class="py-0.5 text-xs leading-5 text-gray-500">
                    <span class="font-bold text-gray-900"
                      ><span class="sr-only"></span>{{ activityItem.asset.name }} returned
                      by
                    </span>
                    <span v-if="activityItem.assetUser != undefined">
                      {{ activityItem.assetUser.fullName }}
                    </span>
                  </div>
                  <span class="flex-none py-0.5 text-xs leading-5 text-gray-500">
                    {{ fmtTimeDistance(activityItem.actionDate) }}
                  </span>
                </div>
                <p class="text-sm leading-6 text-gray-500">
                  {{ activityItem.conditionCheckNotes }}
                </p>
              </div>
            </template>
            <template
              v-else-if="
                activityItem.assetActionType == 4 && activityItem.asset.status !== 5
              "
            >
              <div
                class="relative flex h-6 w-6 flex-none items-center justify-center bg-white"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <div class="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                <div class="flex justify-between gap-x-4">
                  <div class="py-0.5 text-xs leading-5 text-gray-500">
                    <span class="font-bold text-gray-900"
                      ><span class="sr-only"></span>
                      {{ activityItem.asset.name }} disposed on
                      {{ fmtToLocalShortDate(activityItem.asset.disposeDate) }}
                    </span>
                  </div>
                  <span class="flex-none py-0.5 text-xs leading-5 text-gray-500">
                    {{ fmtTimeDistance(activityItem.actionDate) }}
                  </span>
                </div>
                <p class="text-sm leading-6 text-gray-500">
                  {{ activityItem.asset.disposeReason }}
                </p>
              </div>
            </template>
            <template v-else-if="activityItem.assetActionType == 1">
              <div
                class="relative flex h-6 w-6 flex-none items-center justify-center bg-white"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                new asset
                <span class="font-bold text-gray-900">{{ activityItem.asset.name }}</span>
                added by
                <span class="font-bold text-gray-900">{{
                  activityItem.insertedBy.fullName
                }}</span>
                <!-- <span v-if="activityItem.assetUser != undefined">
                  {{ activityItem.assetUser.fullName }}
                </span>   -->
              </p>
              <span class="flex-none py-0.5 text-xs leading-5 text-gray-500">
                {{ fmtTimeDistance(activityItem.actionDate) }}
              </span>
            </template>
            <template v-else-if="activityItem.assetActionType == 2">
              <div
                class="relative flex h-6 w-6 flex-none items-center justify-center bg-white"
              >
                <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                <span class="font-bold text-gray-900">{{ activityItem.asset.name }}</span>
                Assigned to
                <span v-if="activityItem.assetUser != undefined">
                  {{ activityItem.assetUser.fullName }}
                </span>
              </p>
              <span class="flex-none py-0.5 text-xs leading-5 text-gray-500">
                {{ fmtTimeDistance(activityItem.actionDate) }}
              </span>
            </template>
          </li>
        </ul>
        <div ref="sentinel" />
      </div>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { AssetRegisterStore } from "@/store/modules/asset";
import {
  fmtTimeDistance,
  fmtToLocalShortDate,
} from "@/composable/date";
import { useInfiniteListable, useInfiniteTrigger } from "@/composable/infinite-list";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
  },
  setup(props, { emit }) {
    const store = useStore();
    const { items, loading, fetch, reset } = useInfiniteListable({
      items: AssetRegisterStore.getters.GET_ASSET_REGISTERS_LOGS,
      query: AssetRegisterStore.actions.GET_ASSET_REGISTERS_LOGS,
      queryParams: () => ({
        id: props.id,
      }),
    });

    function loadMore() {
      if (loading.value) {
        return;
      }

      fetch();
    }
    const { container, sentinel } = useInfiniteTrigger(loadMore);

    return {
      fmtToLocalShortDate,
      fmtTimeDistance,
      items,
      loading,
      fetch,
      reset,
      container,
      sentinel,
    };
  },
});
</script>
