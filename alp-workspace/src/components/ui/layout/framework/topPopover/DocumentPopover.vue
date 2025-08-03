<script setup lang="ts">
import { FileCheck2 } from "lucide-vue-next";
import { computed } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";

//migrated from old timer popover

import ActiveDocuments from "@/components/ui/documents/ActiveDocuments.vue";
import ReceivedDocumentReviewRequests from "@/components/ui/documents/ReceivedDocumentReviewRequests.vue";
import RequestedDocumentReviewRequests from "@/components/ui/documents/RequestedDocumentReviewRequests.vue";
import { DocumentStore } from "@/store/modules/documents";
import { UserStore } from "@/store/modules/users";
import { useStore } from "vuex";

const store = useStore();
const tab = computed(
  () => store.getters[DocumentStore.getters.GET_DOCUMENTS_TAB]
);

function setTab(tab: "active" | "received" | "requested") {
  store.commit(DocumentStore.mutations.SET_DOCUMENT_TAB, tab);
}

const hasActiveDocument = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasActiveDocument
);

const hasIncompleteReviewRequest = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasIncompleteReviewRequest
);

const hasUnacknowledgedCompletedDocumentReview = computed(
  () =>
    store.getters[UserStore.getters.GET_ME]?.hasUnacknowledgedCompletedReview
);

</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <FileCheck2 class="w-5 h-5" />
        <alp-loader
          v-if="hasActiveDocument || hasIncompleteReviewRequest || hasUnacknowledgedCompletedDocumentReview"
          class="absolute animate-spin text-blue-600"
          size="30"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <!-- migrated from old document popover -->

      <div class="flex items-center justify-between">Documents</div>

      <Tabs default-value="active" class="space-y-4">
        <TabsList class="flex justify-center">
          <TabsTrigger value="active">
            <div class="flex items-center">
              <span class="relative flex h-3 w-3 mr-2" v-if="hasActiveDocument">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                ></span>
              </span>
              <span> Active </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="received">
            <div class="flex items-center">
              <span
                class="relative flex h-3 w-3 mr-2"
                v-if="hasIncompleteReviewRequest"
              >
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                ></span>
              </span>
              <span> To Review </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="requested">
            <div class="flex items-center">
              <span
                class="relative flex h-3 w-3 mr-2"
                v-if="hasUnacknowledgedCompletedDocumentReview"
              >
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                ></span>
              </span>
              <span> Requested </span>
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" class="space-y-4">
          <active-documents />
        </TabsContent>
        <TabsContent value="received">
          <received-document-review-requests />
        </TabsContent>
        <TabsContent value="requested">
          <requested-document-review-requests />
        </TabsContent>
      </Tabs>

    </PopoverContent>
  </Popover>
</template>
