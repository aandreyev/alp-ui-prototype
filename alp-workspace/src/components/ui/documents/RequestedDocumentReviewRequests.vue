<template>
  <div ref="container">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex flex-col mx-3 my-1 p-3 text-xs rounded"
      :class="{
        'bg-yellow-100': !item.complete,
        'bg-green-100': item.complete
      }"
    >
      <span class="text-xs font-medium mb-1">{{ item.document.fileName }}</span>
      <span>{{ item.comment }}</span>
      <div class="flex items-center justify-between">
        <span>Reviewer: {{ item.reviewer.fullName }}</span>
        <document-actions
          :document="item.document"
          :can-edit="false"
          :can-delete="false"
          :can-add-reminder="false"
          :can-request-review="false"
          @updated="fetchDocument"
          @deleted="$emit('close')"
        />
      </div>
      <div class="mt-1 flex justify-end" v-if="item.complete">
        <alp-button variant="success" @click="acknowledgeReview(item)">
          <font-awesome-icon icon="fa-check" />
        </alp-button>
      </div>
    </div>

    <alp-empty
      :content="'No documents requested for review'"
      v-if="items.length == 0"
    >
    </alp-empty>
  </div>
</template>

<script lang="ts">
import DocumentActions from "@/components/ui/documents/DocumentActions.vue";
import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";
import { DocumentReviewDto } from "@/network/dtos/document-dto";
import { DocumentStore } from "@/store/modules/documents";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    DocumentActions
  },
  setup() {
    const { items, loading, fetch, reset } = useInfiniteListable({
      items: DocumentStore.getters.GET_REQUESTED_DOCUMENT_REVIEW_REQUESTS,
      query: DocumentStore.actions.GET_REQUESTED_DOCUMENT_REVIEW_REQUESTS,
      queryParams: () => ({})
    });

    function loadMore() {
      if (loading.value) {
        return;
      }

      fetch();
    }

    const { container, sentinel } = useInfiniteTrigger(loadMore);

    const store = useStore();

    function acknowledgeReview(item: DocumentReviewDto) {
      store.dispatch(
        DocumentStore.actions.ACKNOWLEDGE_DOCUMENT_REVIEW_REQUEST,
        {
          id: item.id
        }
      );
    }

    return { items, loading, container, reset, sentinel, acknowledgeReview };
  }
});
</script>
