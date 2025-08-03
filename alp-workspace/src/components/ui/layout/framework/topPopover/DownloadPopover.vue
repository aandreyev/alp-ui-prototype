<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <CloudDownload class="w-5 h-5" />
        <alp-loader
          v-if="hasPendingDownloads"
          class="absolute animate-spin text-blue-600"
          size="30"
        />

        <span
          v-if="hasDownloads"
          class="flex items-center justify-center h-3 w-3 absolute right-0 top-0 m-1"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
          >
          </span>
          <span
            class="relative inline-flex rounded-full h-2 w-2 bg-red-500"
          ></span>
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <!-- migrated from old downloads popover -->

      <div class="flex flex-col pb-3">
        <nav-separator class="mb-3"
          ><div class="flex items-center justify-between">Downloads</div>
        </nav-separator>
        <div class="h-80 overflow-y-auto">
          <div
            v-for="download in downloads"
            :key="download.submissionId"
            class="flex items-center justify-between my-1 p-2 text-sm border rounded-sm"
          >
            <span>{{ download.name }}</span>
            <div class="flex items-center">
              <div class="grid grid-flow-col items-center gap-1">
                <template
                  v-if="download.status == SyntaqDownloadStatus.Assembling"
                >
                  <alp-loader class="animate-spin" />
                </template>
                <template
                  v-else-if="download.status == SyntaqDownloadStatus.Complete"
                >
                  <shad-button
                    v-if="download.allowWord"
                    variant="ghost"
                    size="icon"
                    @click="downloadDocument(download, SyntaqDocumentType.Word)"
                  >
                    <alp-icon
                      :icon="'simple-icons:microsoftword'"
                      :style="{ color: '#2B579A' }"
                    />
                  </shad-button>

                  <shad-button
                    v-if="download.allowExcel"
                    variant="ghost"
                    size="icon"
                    @click="
                      downloadDocument(download, SyntaqDocumentType.Excel)
                    "
                  >
                    <alp-icon
                      :icon="'simple-icons:microsoftexcel'"
                      :style="{ color: '#217346' }"
                    />
                  </shad-button>

                  <!-- <alp-icon-button
                    v-if="download.allowPDF"
                    icon-name="simple-icons:adobeacrobatreader"
                    :style="{ color: '#EC1C24' }"
                    @click="downloadDocument(download, SyntaqDocumentType.Pdf)"
                  /> -->
                  <shad-button
                    v-if="download.allowPDF"
                    variant="ghost"
                    size="icon"
                    @click="downloadDocument(download, SyntaqDocumentType.Pdf)"
                  >
                    <alp-icon
                      :icon="'simple-icons:adobeacrobatreader'"
                      :style="{ color: '#EC1C24' }"
                    />
                  </shad-button>
                </template>
                <template v-else>
                  <CircleAlert class="text-red-500" />
                </template>

                <shad-button
                  variant="ghost"
                  size="icon"
                  @click="removeDocument(download)"
                >
                  <Trash2 class="w-5 h-5" />
                </shad-button>
              </div>
            </div>
          </div>
          <alp-empty
            v-if="downloads.length == 0"
            :content="'Nothing is ready for download'"
          >
          </alp-empty>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
import { CloudDownload, Trash2, CircleAlert } from "lucide-vue-next";
import { computed } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";

import {
  DownloadStore,
  SyntaqDocumentType,
  SyntaqDownload,
  SyntaqDownloadStatus
} from "@/store/modules/downloads";
import { useStore } from "vuex";

const store = useStore();

const downloads = computed(
  () => store.getters[DownloadStore.getters.GET_DOWNLOADS]
);

function downloadDocument(download: SyntaqDownload, type: SyntaqDocumentType) {
  store.dispatch(DownloadStore.actions.DOWNLOAD_DOCUMENT, {
    submissionId: download.submissionId,
    type
  });
}

function removeDocument(download: SyntaqDownload) {
  store.dispatch(DownloadStore.actions.REMOVE_DOWNLOAD, {
    submissionId: download.submissionId
  });
}
const hasPendingDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_PENDING_DOWNLOADS]
);
const hasDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_DOWNLOADS]
);
//migrated from old downloads popover
</script>
