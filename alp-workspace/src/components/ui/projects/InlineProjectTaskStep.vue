<template>
  <div class="flex flex-col text-xs">
    <div class="w-full flex items-center text-sm pr-3">
      <input
        v-if="isStepsCheckList"
        class="mx-3 text-green-400"
        type="checkbox"
        v-model="state.complete"
        @change="patchStepData"
      />
      <edit-inline-text-area
        class="flex-1 break-all"
        :class="{
          'ml-3': !isStepsCheckList
        }"
        style="min-width: 300px"
        v-model="state.description"
        placeholder="Enter a description"
        @valueUpdated="patchStepData"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="inline-flex items-center p-2 text-lg font-medium text-center text-gray-700 bg-white rounded hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
          >
            <iconify-icon icon="lucide:ellipsis-vertical" class="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="resourceState.showSyntaqSelector = true">
            <iconify-icon icon="lucide:file-text" class="mr-2 h-4 w-4" />
            <span>Add Syntaq Forms</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="resourceState.showUrlSelector = true">
            <iconify-icon icon="lucide:link" class="mr-2 h-4 w-4" />
            <span>Add Resource Url</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="resourceState.showResourceSelector = true">
            <iconify-icon icon="lucide:file-plus" class="mr-2 h-4 w-4" />
            <span>Add Resource</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="deleteStep">
            <iconify-icon icon="lucide:trash-2" class="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-if="resources && resources.length > 0" class="w-full pt-3 px-3">
      <div
        v-for="resource in resources"
        :key="resource.id"
        class="w-full flex items-center justify-between px-2 py-1 bg-white rounded-md mb-1 space-x-2"
      >
        <template v-if="resource.resourceUrl">
          <div
            class="w-full flex items-center text-xs rounded-lg border text-foreground group px-4 py-2"
          >
            <div class="flex items-center min-w-0 flex-1">
              <iconify-icon
                icon="lucide:link"
                class="mr-3 h-4 w-4 flex-shrink-0"
              />
              <a
                class="flex flex-col min-w-0 overflow-hidden group-hover:text-blue-500 transition-colors duration-200"
                target="_blank"
                :href="resource.resourceUrl.url"
              >
                <div class="flex items-center">
                  <span class="font-sm truncate">{{
                    resource.resourceUrl.name
                  }}</span>
                  <iconify-icon
                    icon="lucide:external-link"
                    class="ml-2 h-3.5 w-3.5 transition-opacity duration-200"
                  />
                </div>
                <span
                  v-if="resource.resourceUrl.description"
                  class="text-gray-500 truncate"
                >
                  {{ resource.resourceUrl.description }}
                </span>
              </a>
            </div>
          </div>
        </template>
        <template v-else-if="resource.resourceDocument">
          <div
            class="w-full flex items-center justify-between text-xs rounded-lg border text-foreground px-4 py-2"
          >
            <div class="flex items-center">
              <iconify-icon icon="lucide:file" class="mr-3 h-4 w-4" />
              <span
                >{{ resource.resourceDocument.fileName
                }}{{ resource.resourceDocument.fileExtension }}</span
              >
            </div>
          </div>
        </template>
        <template v-else-if="resource.syntaqForm">
          <div
            class="w-full flex items-center justify-between text-xs rounded-lg border text-foreground px-4 py-2"
          >
            <div class="flex items-center">
              <iconify-icon icon="lucide:file-text" class="mr-3 h-4 w-4" />
              <div
                class="flex flex-col min-w-0 overflow-hidden hover:text-blue-500 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <span
                    @click="
                      $router.push({
                        name: 'Syntaq Form',
                        params: { id: resource.syntaqForm.id }
                      })
                    "
                    class="font-sm truncate"
                    >{{ resource.syntaqForm.name }}</span
                  >
                  <iconify-icon
                    icon="lucide:external-link"
                    class="ml-2 h-3.5 w-3.5 transition-opacity duration-200"
                  />
                </div>
                <span
                  v-if="resource.syntaqForm?.description"
                  class="text-gray-500 truncate"
                >
                  {{ resource.syntaqForm?.description }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="items-center p-2 text-lg font-medium text-center text-gray-700 bg-white rounded hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
            >
              <iconify-icon icon="lucide:ellipsis-vertical" class="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-if="resource.resourceDocument"
              @click="addDocumentToProject(resource.resourceDocument)"
            >
              <iconify-icon icon="lucide:folder-plus" class="mr-2 h-4 w-4" />
              <span>Add to Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="resource.resourceDocument"
              @click="downloadDocument(resource.resourceDocument)"
            >
              <iconify-icon icon="lucide:download" class="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="removeResource(resource.id!)">
              <iconify-icon icon="lucide:trash-2" class="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <transition name="fade">
      <div>
        <alp-can permission="ResourceDocument.View">
          <resource-syntaq-selector
            v-if="resourceState.showSyntaqSelector"
            @create="addSyntaqFormResource($event)"
            @close="resourceState.showSyntaqSelector = false"
          />
          <resource-selector
            v-if="resourceState.showResourceSelector"
            @create="addDocumentResource($event)"
            @close="resourceState.showResourceSelector = false"
          />
          <resource-url-selector
            v-if="resourceState.showUrlSelector"
            @selected="addUrlResource($event)"
            @close="resourceState.showUrlSelector = false"
          />
        </alp-can>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import EditInlineTextArea from "@/components/inputs/EditInlineTextArea.vue";
import ResourceSelector from "@/components/ui/documents/ResourceSelector.vue";
import ResourceUrlSelector from "@/components/ui/resource-urls/ResourceUrlSelector.vue";
import ResourceSyntaqSelector from "@/components/ui/documents/SyntaqResourceSelector.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/lib/registry/new-york/ui/dropdown-menu";
import { Icon } from "@iconify/vue";
import { DocumentStore } from "@/store/modules/documents";
import { ProjectStore } from "@/store/modules/projects";
import { ApiStore } from "@/store/utils";
import { createPopper, Instance } from "@popperjs/core";
import FileSaver from "file-saver";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";
import { DocumentDto } from "@/network/dtos/document-dto";
import { ProjectTaskStepDto } from "@/network/dtos/project-dto";
import {
  ResourceDto,
  ResourceUrlDto,
  CreateResourceInput
} from "@/network/dtos/resource-dto";
import { SyntaqFormDto } from "@/network/dtos/syntaq-dto";

export default defineComponent({
  emits: ["updated"],
  props: {
    projectId: {
      type: String,
      required: true
    },
    projectTaskId: {
      type: String,
      required: true
    },
    projectTaskStep: {
      type: Object as PropType<ProjectTaskStepDto>,
      required: true
    },
    isStepsCheckList: {
      type: Boolean,
      default: false
    }
  },
  components: {
    EditInlineTextArea,
    ResourceSelector,
    ResourceUrlSelector,
    ResourceSyntaqSelector,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      ...props.projectTaskStep
    });

    watch(
      () => props.projectTaskStep,
      () => {
        Object.assign(state, {
          ...props.projectTaskStep
        });
      }
    );

    //
    const optionsState = reactive({
      showOptions: false
    });
    const selector = ref<HTMLElement | null>(null);
    const dropdown = ref<HTMLElement | null>(null);
    let popper: Instance | null = null;

    function clickOutside(event: MouseEvent) {
      if (
        !(
          selector.value == event.target ||
          selector.value?.contains(event.target as Node)
        ) &&
        !(
          dropdown.value == event.target ||
          dropdown.value?.contains(event.target as Node)
        )
      ) {
        optionsState.showOptions = false;
        // state.search = "";
      }
    }

    onMounted(() => document.addEventListener("mousedown", clickOutside));
    onUnmounted(() => document.removeEventListener("mousedown", clickOutside));

    onMounted(() => {
      popper = createPopper(selector.value!, dropdown.value!, {
        placement: "bottom-start",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 5]
            }
          },
          {
            name: "flip"
          },
          { name: "hide" }
        ]
      });
    });

    function toggleOptions() {
      optionsState.showOptions = !optionsState.showOptions;
      popper!.update();
    }

    function deleteStep() {
      toggleOptions();
      store
        .dispatch(ProjectStore.actions.DELETE_PROJECT_TASK_STEP, {
          projectId: props.projectId,
          projectTaskId: props.projectTaskId,
          projectTaskStepId: props.projectTaskStep.id
        })
        .then(() => {
          emit("updated");
        });
    }

    //

    const resourceState = reactive({
      showResourceSelector: false,
      showUrlSelector: false,
      showSyntaqSelector: false
    });
    const resources = computed(() =>
      ApiStore.toData<ResourceDto[]>(
        store.getters[ProjectStore.getters.GET_PROJECT_TASK_STEP_RESOURCES](
          props.projectTaskStep.id
        )
      )
    );

    onMounted(() =>
      store.dispatch(ProjectStore.actions.GET_PROJECT_TASK_STEP_RESOURCES, {
        projectId: props.projectId,
        projectTaskId: props.projectTaskId,
        projectTaskStepId: props.projectTaskStep.id
      })
    );

    function addUrlResource(resource: ResourceUrlDto) {
      store.dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_STEP_RESOURCE, {
        projectId: props.projectId,
        projectTaskId: props.projectTaskId,
        projectTaskStepId: props.projectTaskStep.id,
        input: new CreateResourceInput({ resourceUrlId: resource.id })
      });
    }

    function addDocumentResource({ resource }: { resource: DocumentDto }) {
      store.dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_STEP_RESOURCE, {
        projectId: props.projectId,
        projectTaskId: props.projectTaskId,
        projectTaskStepId: props.projectTaskStep.id,
        input: new CreateResourceInput({ resourceDocumentId: resource.id })
      });
    }

    function addSyntaqFormResource({ resource }: { resource: SyntaqFormDto }) {
      store.dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_STEP_RESOURCE, {
        projectId: props.projectId,
        projectTaskId: props.projectTaskId,
        projectTaskStepId: props.projectTaskStep.id,
        input: new CreateResourceInput({ syntaqFormId: resource.id })
      });
    }

    function removeResource(id: number) {
      store.dispatch(ProjectStore.actions.REMOVE_PROJECT_TASK_STEP_RESOURCE, {
        projectId: props.projectId,
        projectTaskId: props.projectTaskId,
        projectTaskStepId: props.projectTaskStep.id,
        id
      });
    }

    function downloadDocument(document: DocumentDto) {
      store
        .dispatch(DocumentStore.actions.GET_LINK, { id: document.id })
        .then((response) => {
          FileSaver.saveAs(response);
        });
    }

    function addDocumentToProject(document: DocumentDto) {
      store.dispatch(ProjectStore.actions.CREATE_DOCUMENT_FROM_RESOURCE, {
        id: props.projectId,
        resource: document
      });
    }

    function patchStepData() {
      store
        .dispatch(ProjectStore.actions.PATCH_PROJECT_TASK_STEP, {
          projectId: props.projectId,
          projectTaskId: props.projectTaskId,
          id: props.projectTaskStep.id,
          original: props.projectTaskStep || {},
          updated: state
        })
        .then(() => {
          emit("updated");
        });
    }

    return {
      state,
      selector,
      dropdown,
      optionsState,
      toggleOptions,
      deleteStep,
      resourceState,
      resources,
      addUrlResource,
      addDocumentResource,
      addSyntaqFormResource,
      removeResource,
      downloadDocument,
      addDocumentToProject,
      patchStepData
    };
  }
});
</script>
