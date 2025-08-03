<template>
  <div ref="container">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex flex-col mx-3 my-1 p-3 text-xs rounded bg-gray-100"
    >
      <span class="text-xs font-medium mb-1">{{ item.document.fileName }}</span>
      <span>{{ item.message }}</span>
      <div class="flex items-center justify-between">
        <span>Requested By: {{ item.requester.fullName }}</span>
        <document-actions
          :document="item.document"
          :can-edit="!item.complete"
          :can-delete="false"
          :can-add-reminder="false"
          :can-request-review="false"
          :can-show-preview="false"
          @updated="reset"
          @deleted="$emit('close')"
        />
      </div>
      <div class="py-3 flex justify-front">
        <alp-button variant="success" @click="completeReview(item)">
          <font-awesome-icon icon="fa-check" />
        </alp-button>
      </div>
    </div>

    <alp-empty :content="'No documents for review'" v-if="items.length == 0">
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
import { ModalStore, ModalType } from "@/store/modules/modals";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    DocumentActions
  },
  setup() {
    const { items, loading, fetch, reset } = useInfiniteListable({
      items: DocumentStore.getters.GET_RECEIVED_DOCUMENT_REVIEW_REQUESTS,
      query: DocumentStore.actions.GET_RECEIVED_DOCUMENT_REVIEW_REQUESTS,
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

    function completeReview(review: DocumentReviewDto) {
      store.dispatch(ModalStore.actions.SHOW_MODAL, {
        props: { id: review.id },
        modal: ModalType.CompleteDocumentReviewRequest
      });
    }

    return {
      items,
      loading,
      reset,
      container,
      sentinel,
      completeReview
    };
  }
});
</script>
