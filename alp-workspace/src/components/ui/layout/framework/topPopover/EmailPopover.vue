<template>
  <Button
    class="w-9 h-9 relative"
    :variant="'ghost'"
    :size="'icon'"
    @click="togglePopover"
  >
    <Mail class="w-5 h-5" />
    <span
      v-if="hasDraft"
      class="flex items-center justify-center h-3 w-3 absolute right-0 top-0 m-1"
    >
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
      ></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
  </Button>

  <Popover :open="isPopoverVisible">
    <PopoverTrigger as-child></PopoverTrigger>
    <PopoverContent
      :style="{ width: '800px', border: 'none' }"
      :sideOffset="55"
      class="!p-0"
      :class="state.isMinimize == false ? 'no-minimize' : 'minimize'"
    >
      <nav-separator class="flex pl-3 pr-3 bg-gray-600 rounded-t-lg">
        <div class="flex items-center justify-between w-full">
          <h2 class="text-white truncate max-w-md">
            {{ subject === "" ? "New Email" : subject }}
          </h2>
          <div class="flex flex-row-reverse items-center" v-if="isLockIcon">
            <font-awesome-icon
              :icon="'fa-solid fa-x fa-2xl'"
              class="text-gray-300 mr-2 float-right w-4 h-4"
              @click.stop="closePopover"
            />
            <font-awesome-icon
              :icon="
                state.isMinimize
                  ? 'fa-solid fa-window-maximize fa-2xl'
                  : 'fa-solid fa-window-minimize fa-2xl'
              "
              class="text-gray-300 float-right mr-2 w-4 h-4"
              @click="state.isMinimize = !state.isMinimize"
            />
          </div>
        </div>
      </nav-separator>
      <ScrollArea
        class="flex flex-col h-screen scroll-area-box"
        v-if="!state.isMinimize"
      >
        <span class="w-full p-3 inline-block">
          <div
            class="flex items-center justify-between justify-items-center mb-3"
          >
            <div class="mr-2 text-xs w-full">
              <div class="border-gray-200 border rounded mb-1">
                <multi-input-contact-selector
                  placeholder="To"
                  v-model="to"
                  rules="email"
                  :removeboder="true"
                  v-on:keydown="onKeyDown"
                  can-clear
                />
              </div>
            </div>
            <div class="flex" v-if="!state.isCc || !state.isBcc">
              <a
                href="#"
                v-show="state.isCc == false"
                class="text-gray-900 mr-2 hover:underline"
                @click="state.isCc = true"
                >Cc</a
              >
              <a
                href="#"
                v-show="state.isBcc == false"
                class="text-gray-900 mr-2 hover:underline"
                @click="state.isBcc = true"
                >Bcc</a
              >
            </div>
          </div>
          <div v-show="state.isCc || cc.length > 0">
            <div class="text-xs mb-1">
              <div class="border-gray-200 border rounded mb-1">
                <multi-input-contact-selector
                  placeholder="Cc"
                  v-model="cc"
                  rules="email"
                  :removeboder="true"
                  v-on:keydown="onKeyDown"
                />
              </div>
            </div>
          </div>
          <div v-show="state.isBcc || bcc.length > 0">
            <div class="text-xs mb-1">
              <div class="border-gray-200 border rounded mb-1">
                <multi-input-contact-selector
                  placeholder="Bcc"
                  v-model="bcc"
                  rules="email"
                  :removeboder="true"
                  v-on:keydown="onKeyDown"
                />
              </div>
            </div>
          </div>

          <div class="text-xs">
            <inline-input
              placeholder="Subject"
              v-model="subject"
              class="mb-2"
              v-on:keydown="onKeyDown"
              :keepFocus="true"
            />
          </div>
          <div class="flex">
            <div class="text-xs w-1/2">
              <span class="justify-between w-full">
                <matter-selector
                  :modelValue="value"
                  can-clear
                  @update:modelValue="selectedMatterInfo"
                  v-on:keydown="onKeyDown"
                />
              </span>
            </div>
            <div class="mb-1 text-xs w-1/2">
              <span class="justify-between w-full">
                <email-template-offring-selector
                  class="mb-1"
                  v-model="state.emailTemplate"
                  :canClear="true"
                />
              </span>
            </div>
          </div>

          <div class="mb-6">
            <email-editor
              v-model="body"
              v-on:keydown="onKeyDown"
              :isShowThreeDots="threadEmailContent != ''"
              :fixedHTML="threadEmailContent"
            />
          </div>

          <!-- Email Attachment -->
          <span
            class="mx-2 text-sm font-semibold"
            v-if="attachments.length >= 1"
          >
            Attachments
          </span>
          <div
            class="mb-1 flex flex-wrap max-h-28 overflow-y-auto"
            v-if="attachments.length >= 1"
          >
            <span
              v-for="(attachment, index) in attachments"
              :key="index"
              class="p-1 flex items-center w-full"
            >
              <span
                class="flex-1 text-xs font-medium bg-gray-200 rounded-md py-1 px-2"
              >
                {{ attachment.name }}({{ (attachment.size / 1024).toFixed(2) }}
                KB)
              </span>
              <span
                class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                role="button"
                @click="removeAttachment(index)"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" size="12" />
              </span>
            </span>
          </div>

          <!-- Documents -->
          <span class="mx-2 text-sm font-semibold" v-if="documents.length >= 1">
            Documents
          </span>
          <div
            class="mb-1 flex flex-wrap max-h-28 overflow-y-auto"
            v-if="documents.length >= 1"
          >
            <span
              v-for="(document, index) in documents"
              :key="index"
              class="p-1 flex items-center w-full"
            >
              <span
                class="flex-1 text-xs font-medium bg-gray-200 rounded-md py-1 px-2"
              >
                {{ document.fileName }}{{ document.fileExtension }}
              </span>
              <span
                class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                role="button"
                @click="removeDocument(index)"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" />
              </span>
            </span>
          </div>
        </span>
      </ScrollArea>
      <span
        class="flex flex-col justify mx-3 mt-5 mb-2"
        v-if="!state.isMinimize"
      >
        <div class="flex justify-between">
          <span class="flex items-center">
            <alp-button-with-text
              context="Send"
              :color="'green'"
              icon-name="fa-solid fa-paper-plane fa-2xl"
              @click.stop="sendEmail"
            />
            <span>
              <label for="attachment">
                <font-awesome-icon
                  class="h-4 w-4 ml-3 cursor-pointer"
                  icon="fa-solid fa-paperclip"
                  title="Attach Files"
                />
                <input
                  type="file"
                  multiple
                  id="attachment"
                  class="form-input mx-3 text-xs my-1 ml-0 hidden"
                  @change="onFilesUploaded"
                />
              </label>
            </span>
          </span>
          <span>
            <alp-button-with-text
              context="Discard"
              :color="'red'"
              icon-name="fa-solid fa-trash fa-2xl"
              @click.stop="clearControls"
            />
          </span>
        </div>
      </span>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.minimize {
  position: relative;
  top: 83vh;
}

.scroll-area-box {
  height: calc(100vh - 200px);
}
</style>

<script setup lang="ts">
import { Mail } from "lucide-vue-next";
import { onMounted, watch, reactive, ref, onUnmounted } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import MatterSelector from "@/components/inputs/selectors/MatterSelector.vue";
import NavSeparator from "@/components/common/NavSeparator.vue";
import EmailEditor from "@/components/inputs/EmailEditor.vue";

import {
  SEND_EMAIL_MODULE_NAME,
  SendEmailStore
} from "@/store/modules/send-email";
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";

import { useField } from "vee-validate";

import { ApiStore } from "@/store/utils";
import { MatterStore } from "@/store/modules/matters";
// import ContactSelector from "@/components/inputs/selectors/ContactSelector.vue";
import EmailTemplateOffringSelector from "@/components/inputs/selectors/EmailTemplateOffringSelector.vue";

import MultiInputContactSelector from "@/components/inputs/selectors/MultiInputContactSelector.vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import { ScrollArea, ScrollBar } from "@/lib/registry/new-york/ui/scroll-area";
import { Instance, createPopper } from "@popperjs/core";
import { ModalStore } from "@/store/modules/modals";
import { ContactDto } from "@/network/dtos/contact-dto";
import { EmailTemplateListDto } from "@/network/dtos/email-dto";
import { MatterListDto, MatterDto } from "@/network/dtos/matter-dto";
import { OfferingCategoryDto } from "@/network/dtos/offering-dto";
//migrated from old email popover
const emit = defineEmits(["email-sender"]);
const state = reactive({
  isOpen: false,
  to: [],
  cc: [],
  bcc: [],
  subject: "",
  content: "",
  chosenMatterId: "",
  chosenMatterReviewer: "",
  chosenMatterCoordinator: "",
  chosenMatterName: "",
  chosenEmail: "",
  emailArray: [] as string[],
  ccArray: [] as string[],
  bccArray: [] as string[],
  isMinimize: false,
  isCc: false,
  isBcc: false,
  Expanded: false,
  lastMatterEmail: [] as string[],
  offeringCategory: null as OfferingCategoryDto | null,
  emailTemplate: null as EmailTemplateListDto | null,
  offset: 50
});

function handleEmailLockIconClick(value: any) {
  state.isOpen = value;
}

// const props = defineProps(), {
//   hasDraft: false,
//   matterId: Number,
//   name: String,
//   rules: [String, Object] as PropType<string | Record<string, unknown>>,
//   isLockIcon: { type: Boolean, required: false, default: true }
// };
const props = defineProps<{
  matterId: Number;
  name: String;

  isLockIcon: Boolean;
  rules: any;
}>();
function minimizeMenu() {
  state.isMinimize = !state.isMinimize;
  if (state.isMinimize) state.offset = 700;
  else state.offset = 50;
}
const store = useStore();
const to = computed({
  get: () => store.state[SEND_EMAIL_MODULE_NAME].to,
  set: (value) => store.commit(SendEmailStore.mutations.SET_TO, value)
});
const cc = computed({
  get: () => store.state[SEND_EMAIL_MODULE_NAME].cc,
  set: (value) => store.commit(SendEmailStore.mutations.SET_CC, value)
});
const bcc = computed({
  get: () => store.state[SEND_EMAIL_MODULE_NAME].bcc,
  set: (value) => store.commit(SendEmailStore.mutations.SET_BCC, value)
});
const subject = computed({
  get: () => store.state[SEND_EMAIL_MODULE_NAME].subject,
  set: (value) => store.commit(SendEmailStore.mutations.SET_SUBJECT, value)
});

const body = computed({
  get: () => store.state[SEND_EMAIL_MODULE_NAME].body,
  set: (value) => store.commit(SendEmailStore.mutations.SET_BODY, value)
});
const attachments = computed(
  () => store.state[SEND_EMAIL_MODULE_NAME].attachments
);
const threadEmailContent = computed(
  () => store.state[SEND_EMAIL_MODULE_NAME].threadEmailContent
);

const emailCCCount = computed(
  () => store.getters[SendEmailStore.getters.EMAIL_SET_CC_OPEN]
);
const documents = computed(
  () => store.state[SEND_EMAIL_MODULE_NAME].documentAttachments
);

const { value, handleChange, errorMessage } = useField(
  props.name,
  props.rules || {}
);

function handleExpandClick() {
  state.Expanded = !state.Expanded;
}

watch([() => state.emailTemplate], () => {
  if (state.emailTemplate != undefined)
    store.commit(
      SendEmailStore.mutations.SET_BODY,
      state.emailTemplate?.content + store.state[SEND_EMAIL_MODULE_NAME].body
    );
});

function selectedMatterInfo(matter: MatterListDto) {
  // prepare matter info
  handleChange(matter);
  removeLastMatterEmails();
  state.lastMatterEmail = [];

  state.chosenMatterId = String(matter.id!);
  state.chosenMatterName = matter.name!;
  state.chosenMatterReviewer = matter.reviewer?.email
    ? matter.reviewer?.email
    : "";
  state.chosenMatterCoordinator = matter.coordinator?.email
    ? matter.coordinator?.email
    : "";
  const relevantInfo = computed(() =>
    ApiStore.toData<MatterDto>(
      store.getters[MatterStore.getters.GET_MATTER](state.chosenMatterId)
    )
  );

  // assemble email list
  if (state.chosenMatterReviewer != "") {
    state.emailArray.push(state.chosenMatterReviewer);
    state.lastMatterEmail.push(state.chosenMatterReviewer);
  }
  if (state.chosenMatterCoordinator != "") {
    state.emailArray.push(state.chosenMatterCoordinator);
    state.lastMatterEmail.push(state.chosenMatterCoordinator);
  }
  relevantInfo.value?.team?.forEach((element) => {
    if (element.email !== undefined) {
      state.emailArray.push(element.email);
      state.lastMatterEmail.push(element.email);
    }
  });

  state.chosenMatterId = "[" + state.chosenMatterId + "]";
  state.subject = state.chosenMatterId;
  store.commit(SendEmailStore.mutations.SET_SUBJECT, state.chosenMatterId);
  state.emailArray = getAllUnique(state.emailArray, to.value);
  store.commit(SendEmailStore.mutations.SET_TO, state.emailArray);
}

function removeLastMatterEmails() {
  state.lastMatterEmail.forEach(function (value, i) {
    let index = state.emailArray.indexOf(value);
    if (index > -1) state.emailArray.splice(index, 1);
  });
}

function addEmailToTo(contactOrContacts: ContactDto | ContactDto[]) {
  const contacts = Array.isArray(contactOrContacts)
    ? contactOrContacts
    : [contactOrContacts];

  contacts.forEach((contact) => {
    if (contact.email) {
      state.emailArray.push(contact.email);
    }
  });

  //state.emailArray.push(contact.email!);
  state.emailArray = getAllUnique(state.emailArray, to.value);
  store.commit(SendEmailStore.mutations.SET_TO, state.emailArray);
}

function getAllUnique(array1: string[], array2: string[]): string[] {
  array2.forEach(function (value, i) {
    if (array1.indexOf(value) === -1) array1.push(value);
  });
  return array1;
}

function addEmailToBcc(contact: ContactDto) {
  state.bccArray.push(contact.email!);
  state.bccArray = getAllUnique(state.bccArray, bcc.value);
  store.commit(SendEmailStore.mutations.SET_BCC, state.bccArray);
}

function addEmailToCc(contact: ContactDto) {
  state.ccArray.push(contact.email!);
  state.ccArray = getAllUnique(state.ccArray, cc.value);
  store.commit(SendEmailStore.mutations.SET_CC, state.ccArray);
}

function onFilesUploaded(e: any) {
  var files = e.target.files || e.dataTransfer.files;
  if (!files.length) return;

  store.commit(SendEmailStore.mutations.SET_ATTACHMENTS, [
    ...store.state[SEND_EMAIL_MODULE_NAME].attachments,
    ...files
  ]);
}

function sendEmail() {
  if (store.state[SEND_EMAIL_MODULE_NAME].isReply)
    store.dispatch(SendEmailStore.actions.REPLY_EMAIL);
  else if (store.state[SEND_EMAIL_MODULE_NAME].isReplyAll)
    store.dispatch(SendEmailStore.actions.REPLY_ALL_EMAIL);
  else if (store.state[SEND_EMAIL_MODULE_NAME].isForward)
    store.dispatch(SendEmailStore.actions.FORWARD_EMAIL);
  else store.dispatch(SendEmailStore.actions.SEND_EMAIL);
}
function onKeyDown(e: any) {
  if (
    e.code === "Space" ||
    e.code === "Enter" ||
    e.code === "ArrowUp" ||
    e.code === "ArrowDown"
  ) {
    e.stopPropagation();
  }
}

function clearControls() {
  store.commit(SendEmailStore.mutations.CLEAR_EMAIL);
  state.emailArray = [];
  state.ccArray = [];
  state.bccArray = [];
  state.subject = "";
  state.lastMatterEmail = [];
  state.emailTemplate = null;
  //selectedMatterInfo(new MatterListDto);
  handleChange(null);
}

function setCCSectionOpen() {
  state.isCc = true;
}
function removeAttachment(index: any) {
  store.commit(SendEmailStore.mutations.REMOVE_ATTACHMENT, index);
}

function removeDocument(index: any) {
  store.commit(SendEmailStore.mutations.REMOVE_DOCUMENT_ATTACHMENT, index);
}

watch([() => emailCCCount], () => {
  setCCSectionOpen();
});
const emailModalOpenCount = computed(
  () => store.getters[SendEmailStore.getters.EMAIL_MODAL_OPEN]
);
const hasDraft = computed(
  () => store.getters[SendEmailStore.getters.HAVE_DRAFT]
);
const isPopoverVisible = ref(false);

const togglePopover = () => {
  isPopoverVisible.value = !isPopoverVisible.value;
};

const closePopover = () => {
  isPopoverVisible.value = false;
};
watch(
  [() => emailModalOpenCount],
  () => {
    isPopoverVisible.value = true;
  },
  { deep: true }
);
const handleClickOutside = (event: MouseEvent) => {
  event.stopPropagation();
};
onMounted(() => document.addEventListener("click", handleClickOutside));
</script>
