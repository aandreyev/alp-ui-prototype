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
      <edit-inline-input
        class="flex-1 mx-3"
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
        class="w-full flex items-center justify-between px-5 py-1 bg-white rounded-md mb-1"
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
              <span>{{ resource.syntaqForm.name }}</span>
            </div>
          </div>
        </template>
        <alp-options>
          <span
            v-if="resource.resourceDocument"
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
        </alp-options>
      </div>
    </div>

    <transition name="fade">
      <alp-can permission="ResourceDocument.View">
        <syntaq-resource-selector
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
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import { createPopper, Instance } from "@popperjs/core";

import { useStore } from "vuex";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import ResourceSelector from "@/components/ui/documents/ResourceSelector.vue";
import ResourceUrlSelector from "@/components/ui/resource-urls/ResourceUrlSelector.vue";
import SyntaqResourceSelector from "@/components/ui/documents/SyntaqResourceSelector.vue";
import { DocumentStore } from "@/store/modules/documents";
import FileSaver from "file-saver";
import { ApiStore } from "@/store/utils";
import { DocumentDto } from "@/network/dtos/document-dto";
import { StandardTaskStepDto } from "@/network/dtos/project-dto";
import {
  ResourceDto,
  ResourceUrlDto,
  CreateResourceInput
} from "@/network/dtos/resource-dto";
import { SyntaqFormDto } from "@/network/dtos/syntaq-dto";

export default defineComponent({
  emits: ["updated"],
  props: {
    standardTaskId: {
      type: Number,
      required: true
    },
    standardTaskStep: {
      type: Object as PropType<StandardTaskStepDto>,
      required: true
    },
    isStepsCheckList: {
      type: Boolean,
      default: false
    }
  },
  components: {
    EditInlineInput,
    ResourceSelector,
    ResourceUrlSelector,
    SyntaqResourceSelector
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      ...props.standardTaskStep
    });

    // watch(
    //   () => props.standardTaskStep,
    //   () => {
    //     Object.assign(state, {
    //       ...props.standardTaskStep
    //     });
    //   }
    // );

    // watch(state, () => {
    //   store.dispatch(ProjectTemplateStore.actions.PATCH_STANDARD_TASK_STEP, {
    //     standardTaskId: props.standardTaskId,
    //     id: props.standardTaskStep.id,
    //     original: props.standardTaskStep || {},
    //     updated: state
    //   });
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
      store.dispatch(ProjectTemplateStore.actions.DELETE_STANDARD_TASK_STEP, {
        standardTaskId: props.standardTaskId,
        standardTaskStepId: props.standardTaskStep.id
      });
    }

    //

    const resourceState = reactive({
      showSyntaqSelector: false,
      showResourceSelector: false,
      showUrlSelector: false
    });
    const resources = computed(() =>
      ApiStore.toData<ResourceDto[]>(
        store.getters[
          ProjectTemplateStore.getters.GET_STANDARD_TASK_STEP_RESOURCES
        ](props.standardTaskStep.id)
      )
    );

    onMounted(() =>
      store.dispatch(
        ProjectTemplateStore.actions.GET_STANDARD_TASK_STEP_RESOURCES,
        {
          standardTaskId: props.standardTaskId,
          standardTaskStepId: props.standardTaskStep.id
        }
      )
    );

    function addUrlResource(resource: ResourceUrlDto) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_STANDARD_TASK_STEP_RESOURCE,
        {
          standardTaskId: props.standardTaskId,
          standardTaskStepId: props.standardTaskStep.id,
          input: new CreateResourceInput({ resourceUrlId: resource.id })
        }
      );
    }

    function addDocumentResource({ resource }: { resource: DocumentDto }) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_STANDARD_TASK_STEP_RESOURCE,
        {
          standardTaskId: props.standardTaskId,
          standardTaskStepId: props.standardTaskStep.id,
          input: new CreateResourceInput({ resourceDocumentId: resource.id })
        }
      );
    }

    function addSyntaqFormResource({ resource }: { resource: SyntaqFormDto }) {
      store.dispatch(
        ProjectTemplateStore.actions.CREATE_STANDARD_TASK_STEP_RESOURCE,
        {
          standardTaskId: props.standardTaskId,
          standardTaskStepId: props.standardTaskStep.id,
          input: new CreateResourceInput({ syntaqFormId: resource.id })
        }
      );
    }

    function removeResource(id: number) {
      store.dispatch(
        ProjectTemplateStore.actions.REMOVE_STANDARD_TASK_STEP_RESOURCE,
        {
          standardTaskId: props.standardTaskId,
          standardTaskStepId: props.standardTaskStep.id,
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
      store.dispatch(ProjectTemplateStore.actions.PATCH_STANDARD_TASK_STEP, {
        standardTaskId: props.standardTaskId,
        id: props.standardTaskStep.id,
        original: props.standardTaskStep,
        updated: state
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
      patchStepData
    };
  }
});
</script>
