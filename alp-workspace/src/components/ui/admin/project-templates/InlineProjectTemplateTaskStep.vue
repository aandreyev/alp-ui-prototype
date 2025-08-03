<template>
  <div class="flex flex-col text-xs">
    <div class="w-full flex items-center text-sm pr-3">
      <input
        v-if="isStepsCheckList"
        disabled
        id="disabled-checkbox"
        type="checkbox"
        class="w-4 h-4 text-blue-600 ml-3 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <edit-inline-text-area
        class="flex-1 mx-3 break-all"
        style="min-width: 300px"
        v-model="state.description"
        placeholder="Enter a description"
        @valueUpdated="patchStepData"
      />
      <alp-options>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="resourceState.showSyntaqSelector = true"
        >
          Add Syntaq Forms
        </span>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="resourceState.showUrlSelector = true"
        >
          Add Resource Url
        </span>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="resourceState.showResourceSelector = true"
        >
          Add Resource
        </span>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="deleteStep"
        >
          Delete
        </span>
      </alp-options>
    </div>

    <div v-if="resources && resources.length > 0" class="w-full pt-3 px-3">
      <div
        v-for="resource in resources"
        :key="resource.id"
        class="w-full flex items-center justify-between px-5 py-1 bg-white rounded-sm mb-1"
      >
        <template v-if="resource.resourceUrl">
          <div class="flex items-center">
            <font-awesome-icon icon="fa-solid fa-link" class="mr-3" />
            <a
              class="flex flex-col items-start text-xs"
              target="_blank"
              :href="resource.resourceUrl.url"
            >
              <span>{{ resource.resourceUrl.name }}</span>
              <span v-if="resource.resourceUrl.description">
                {{ resource.resourceUrl.description }}
              </span>
            </a>
          </div>
        </template>
        <template v-else-if="resource.resourceDocument">
          <div class="w-full flex items-center justify-between text-xs">
            <div class="flex items-center">
              <font-awesome-icon icon="fa-regular fa-file" class="mr-3" />
              <span
                >{{ resource.resourceDocument.fileName
                }}{{ resource.resourceDocument.fileExtension }}</span
              >
            </div>
          </div>
        </template>
        <template v-else-if="resource.syntaqForm">
          <div class="w-full flex items-center justify-between text-xs">
            <div class="flex items-center">
              <font-awesome-icon icon="fa-regular fa-file" class="mr-3" />
              <span
                @click="
                  $router.push({
                    name: 'Syntaq Form',
                    params: { id: resource.syntaqForm.id }
                  })
                "
                >{{ resource.syntaqForm.name }}</span
              >
            </div>
          </div>
        </template>
        <alp-options>
          <span
            class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
            @click="downloadDocument(resource.resourceDocument)"
          >
            Download
          </span>
          <span
            class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
            @click="removeResource(resource.id)"
          >
            Delete
          </span>
          <!-- <span
            class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
            @click="$router.push({ name: 'Syntaq Form', params: {id : resource.syntaqForm.id }})"
          >
            To Form
          </span> -->
        </alp-options>
      </div>
    </div>

    <transition name="fade">
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
    </transition>
  </div>
</template>

<script lang="ts">
import EditInlineTextArea from "@/components/inputs/EditInlineTextArea.vue";
import ResourceSelector from "@/components/ui/documents/ResourceSelector.vue";
import ResourceUrlSelector from "@/components/ui/resource-urls/ResourceUrlSelector.vue";
import ResourceSyntaqSelector from "@/components/ui/documents/SyntaqResourceSelector.vue";

import { DocumentStore } from "@/store/modules/documents";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
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
import { ProjectTemplateTaskStepDto } from "@/network/dtos/project-dto";
import {
  ResourceDto,
  ResourceUrlDto,
  CreateResourceInput
} from "@/network/dtos/resource-dto";
import { SyntaqFormDto } from "@/network/dtos/syntaq-dto";

export default defineComponent({
  emits: ["updated"],
  props: {
    projectTemplateId: {
      type: Number,
      required: true
    },
    projectTemplateTaskId: {
      type: Number,
      required: true
    },
    projectTemplateTaskStep: {
      type: Object as PropType<ProjectTemplateTaskStepDto>,
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
    ResourceSyntaqSelector
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      ...props.projectTemplateTaskStep
    });

    // watch(
    //   () => props.projectTemplateTaskStep,
    //   () => {
    //     Object.assign(state, {
    //       ...props.projectTemplateTaskStep
    //     });
    //   }
    // );

    // watch(state, () => {
    //   store.dispatch(
    //     ProjectTemplateStore.actions.PATCH_PROJECT_TEMPLATE_TASK_STEP,
    //     {
    //       projectTemplateId: props.projectTemplateId,
    //       projectTemplateTaskId: props.projectTemplateTaskId,
    //       id: props.projectTemplateTaskStep.id,
    //       original: props.projectTemplateTaskStep || {},
    //       updated: state
    //     }
    //   );
    // });

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
      store.dispatch(
        ProjectTemplateStore.actions.DELETE_PROJECT_TEMPLATE_TASK_STEP,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id
        }
      );
    }

    //

    const resourceState = reactive({
      showResourceSelector: false,
      showUrlSelector: false,
      showSyntaqSelector: false
    });
    const resources = computed(() =>
      ApiStore.toData<ResourceDto[]>(
        store.getters[
          ProjectTemplateStore.getters.GET_PROJECT_TEMPLATE_TASK_STEP_RESOURCES
        ](props.projectTemplateTaskStep.id)
      )
    );

    onMounted(() =>
      store.dispatch(
        ProjectTemplateStore.actions.GET_PROJECT_TEMPLATE_TASK_STEP_RESOURCES,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id
        }
      )
    );

    function addUrlResource(resource: ResourceUrlDto) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE_TASK_STEP_RESOURCE,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id,
          input: new CreateResourceInput({ resourceUrlId: resource.id })
        }
      );
    }

    function addDocumentResource({ resource }: { resource: DocumentDto }) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE_TASK_STEP_RESOURCE,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id,
          input: new CreateResourceInput({ resourceDocumentId: resource.id })
        }
      );
    }

    function addSyntaqFormResource({ resource }: { resource: SyntaqFormDto }) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE_TASK_STEP_RESOURCE,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id,
          input: new CreateResourceInput({ syntaqFormId: resource.id })
        }
      );
    }

    function removeResource(id: number) {
      store.dispatch(
        ProjectTemplateStore.actions.REMOVE_PROJECT_TEMPLATE_TASK_STEP_RESOURCE,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          projectTemplateTaskStepId: props.projectTemplateTaskStep.id,
          id
        }
      );
    }

    function downloadDocument(document: DocumentDto) {
      store
        .dispatch(DocumentStore.actions.GET_LINK, { id: document.id })
        .then((response) => {
          FileSaver.saveAs(response);
        });
    }

    function patchStepData() {
      store.dispatch(
        ProjectTemplateStore.actions.PATCH_PROJECT_TEMPLATE_TASK_STEP,
        {
          projectTemplateId: props.projectTemplateId,
          projectTemplateTaskId: props.projectTemplateTaskId,
          id: props.projectTemplateTaskStep.id,
          original: props.projectTemplateTaskStep || {},
          updated: state
        }
      );
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
      patchStepData
    };
  }
});
</script>
