<template>
  <div ref="container">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex flex-col mx-3 my-1 p-3 text-xs rounded bg-gray-100"
    >
      <span class="text-xs">{{ item.fileName }}</span>
      <div class="flex justify-end">
        <document-actions
          :document="item"
          can-edit
          can-delete
          @updated="fetchDocument"
          @deleted="$emit('close')"
        />
      </div>
    </div>
    <alp-empty :content="'No active document found'" v-if="items.length == 0">
    </alp-empty>
  </div>
</template>

<script lang="ts">
import DocumentActions from "@/components/ui/documents/DocumentActions.vue";
import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";
import { DocumentStore } from "@/store/modules/documents";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    DocumentActions
  },
  setup() {
    const { items, loading, fetch, reset } = useInfiniteListable({
      items: DocumentStore.getters.GET_ACTIVE_DOCUMENTS,
      query: DocumentStore.actions.GET_ACTIVE_DOCUMENTS,
      queryParams: () => ({})
    });

    function loadMore() {
      if (loading.value) {
        return;
      }

      fetch();
    }

    const { container, sentinel } = useInfiniteTrigger(loadMore);

    return { items, loading, reset, container, sentinel };
  }
});
</script>
