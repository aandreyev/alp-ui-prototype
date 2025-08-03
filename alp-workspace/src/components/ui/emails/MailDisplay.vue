<template>
  <div v-if="!isChecked">
    <!-- Skeleton Loading UI -->
    <div
      v-if="state.loading"
      class="flex flex-col bg-white rounded-sm h-auto overflow-auto"
    >
      <ScrollArea class="h-[calc(100vh - 80px)] flex">
        <div class="flex-1 px-2 text-sm">
          <!-- Email Header Skeleton -->
          <div class="sticky top-0 z-10 backdrop-blur flex-1 flex-col py-1">
            <div
              class="m-1 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm"
            >
              <div class="p-2 border-b border-gray-200 bg-white">
                <Skeleton class="h-6 w-3/4 rounded-md" />
              </div>
            </div>
          </div>

          <!-- Email Content Skeleton -->
          <div
            class="m-1 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm"
          >
            <div class="p-2 border-b border-gray-200 bg-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1">
                  <div class="flex-shrink-0 mr-3">
                    <Skeleton class="h-10 w-10 rounded-full" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <Skeleton class="h-5 w-48 rounded-md" />
                      <div class="flex items-center gap-1">
                        <Skeleton class="h-7 w-28 rounded-md" />
                      </div>
                    </div>
                    <div class="mt-2">
                      <Skeleton class="h-4 w-full rounded-md mb-2" />
                      <Skeleton class="h-4 w-3/4 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Email Body Skeleton -->
            <div class="bg-white p-3">
              <!-- Attachments Skeleton -->
              <div class="attachments flex flex-wrap gap-1 p-3 mb-3">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="flex justify-items-center items-center flex-grow-0 text-xs rounded border border-gray-200 px-3 py-2 bg-white"
                >
                  <Skeleton class="h-4 w-4 mr-2 rounded-md" />
                  <Skeleton class="h-4 w-24 rounded-md" />
                </div>
              </div>

              <div class="space-y-3">
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-5/6 rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-4/5 rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-3/4 rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
                <Skeleton class="h-4 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>

    <div
      v-if="email && !state.loading"
      class="sticky top-0 z-10 backdrop-blur flex-1 flex-col py-1 px-2"
    >
      <div
        class="m-1 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm"
      >
        <!-- Email Header -->
        <div class="p-2 border-b border-gray-200 bg-white">
          <div class="text-sm font-semibold text-gray-900">
            {{ email?.subject }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col bg-white rounded-sm h-auto overflow-auto">
      <div v-if="email && !state.loading" class="flex flex-1 flex-col -mt-1">
        <ScrollArea class="h-[calc(100vh - 80px)] flex">
          <div class="flex-1 px-2 text-sm">
            <!-- Email Content -->
            <div
              class="m-1 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm"
            >
              <div class="p-2 border-b border-gray-200 bg-white">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="flex-shrink-0 mr-3">
                      <shad-avatar class="h-10 w-10">
                        <shad-avatar-image
                          class="inline-block rounded-full ring-2 ring-white border border-gray-300"
                          :src="
                            email?.senderProfileImageUrl ||
                            getInitial(email?.senderName || '')
                          "
                          alt=""
                        />
                        <shad-avatar-fallback
                          class="text-grass11 leading-1 flex h-full border border-gray-300 rounded-full w-full items-center justify-center bg-gray-2 text-[15px] font-medium"
                        >
                          {{ getInitial(email?.senderName || "") }}
                        </shad-avatar-fallback>
                      </shad-avatar>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <h3 class="text-sm font-medium text-gray-900">
                            {{ email?.senderName }} <{{ email?.senderAddress }}>
                          </h3>
                        </div>
                        <!-- Actions -->
                        <div class="flex items-center gap-1">
                          <span v-if="email">
                            <!-- Read/UnRead -->
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <MailOpen
                                    v-if="email.isRead"
                                    class="size-3.5"
                                    @click="changeEmailReadStatus(email, false)"
                                  />
                                  <Mail
                                    v-if="!email.isRead"
                                    class="size-3.5"
                                    @click="changeEmailReadStatus(email, true)"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent v-if="email.isRead"
                                >Mark as unread</TooltipContent
                              >
                              <TooltipContent v-if="!email.isRead"
                                >Mark as read</TooltipContent
                              >
                            </Tooltip>
                            <!-- Flag -->
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Flag
                                    v-if="!email.isFlag"
                                    class="size-3.5"
                                    @click="changeEmailFlagStatus(email, true)"
                                  />
                                  <FlagOff
                                    v-else
                                    class="size-3.5 text-red-700"
                                    @click="changeEmailFlagStatus(email, false)"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent v-if="!email.isFlag"
                                >Flag</TooltipContent
                              >
                              <TooltipContent v-else
                                >Remove Flag</TooltipContent
                              >
                            </Tooltip>
                            <!-- Pin -->
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Pin
                                    v-if="!email.isPin"
                                    class="size-3.5"
                                    @click="changeEmailPinStatus(email, true)"
                                  />
                                  <PinOff
                                    v-else
                                    class="size-3.5"
                                    @click="changeEmailPinStatus(email, false)"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent v-if="!email.isPin"
                                >Pin</TooltipContent
                              >
                              <TooltipContent v-else>Unpin</TooltipContent>
                            </Tooltip>
                            <!-- Hide -->
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Eye
                                    class="size-3.5"
                                    v-if="!email.isHide"
                                    @click="hideEmail(email)"
                                  />
                                  <EyeOff
                                    class="size-3.5"
                                    v-if="email.isHide"
                                    @click="hideEmail(email)"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent v-if="email.isHide"
                                >UnHide</TooltipContent
                              >
                              <TooltipContent v-if="!email.isHide"
                                >Hide</TooltipContent
                              >
                            </Tooltip>
                          </span>
                          <Separator orientation="vertical" class="mx-1 h-5" />

                          <span class="flex items-center">
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Reply
                                    class="size-3.5"
                                    @click.stop="emailReplyClick"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reply</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <ReplyAll
                                    class="size-3.5"
                                    @click.stop="emailReplyAllClick"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reply all</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Forward
                                    class="size-3.5"
                                    @click.stop="emailForwardClick"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Forward</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="h-7 w-7 p-0"
                                >
                                  <Printer
                                    class="size-3.5"
                                    @click.stop="printEmail"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Print Email</TooltipContent>
                            </Tooltip>
                          </span>
                          <Separator orientation="vertical" class="mx-1 h-5" />

                          <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                              <Button
                                variant="ghost"
                                size="icon"
                                class="h-7 w-7 p-0"
                                :disabled="!email"
                              >
                                <MoreVertical class="size-3.5" />
                                <span class="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                @click.stop="showAssignEmailToMatterModal"
                              >
                                <Archive class="size-4 flex mr-2" />Assign to a
                                Matter</DropdownMenuItem
                              >
                              <DropdownMenuItem
                                @click.stop="showAssignEmailToProjectModal"
                              >
                                <Archive class="size-4 flex mr-2" />Assign to a
                                Project</DropdownMenuItem
                              >
                              <DropdownMenuItem @click.stop="printEmail">
                                <Printer class="size-4 flex mr-2" />Print Email</DropdownMenuItem
                              >
                              <DropdownMenuItem
                                v-if="
                                  emailType === 'Matter' ||
                                  emailType === 'Contact'
                                "
                              >
                                <alp-can permission="ExportEmail2PDF">
                                  <span
                                    v-if="
                                      email?.matters &&
                                      email.matters.length > 0 &&
                                      emailType == 'Matter'
                                    "
                                    class="flex py-2 text-xs cursor-pointer hover:bg-gray-100"
                                    @click.stop="ExportEmailToPDF"
                                    title=""
                                  >
                                    <SquareArrowDown class="size-4 flex mr-2" />
                                    <span> Export to PDF (Matter)</span>
                                  </span>

                                  <span
                                    v-if="emailType == 'Contact'"
                                    class="flex py-2 text-xs cursor-pointer hover:bg-gray-100"
                                    @click.stop="ExportEmailToPDF"
                                    title=""
                                  >
                                    <SquareArrowDown class="size-4 flex mr-2" />
                                    <span> Export to PDF (Contact)</span>
                                  </span>
                                </alp-can>
                              </DropdownMenuItem>

                              <hr />
                              <DropdownMenuItem v-if="email?.webLink">
                                <a
                                  class="flex cursor-pointer"
                                  :href="email?.webLink"
                                  target="_blank"
                                  ><Globe
                                    class="size-4 flex mr-2 text-blue-600"
                                  />Open in Outlook</a
                                ></DropdownMenuItem
                              >
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-sm mt-2 ml-[52px]">
                  <div
                    class="mb-1"
                    v-if="
                      email &&
                      email.recipients &&
                      email.recipients.some((r) => r.recipientType === 1)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <span class="text-xs font-medium text-gray-700 mr-1"
                          >To:</span
                        >
                        <span class="text-xs">
                          <span
                            v-for="(
                              recipient, index
                            ) in email.recipients.filter(
                              (r) => r.recipientType === 1
                            )"
                            :key="index"
                            class="inline-flex items-center"
                          >
                            <span v-if="index > 0" class="mx-1"> ; </span>
                            <span
                              class="inline-flex items-center text-black font-semibold"
                            >
                              {{ recipient.name }} <{{ recipient.address }}>
                            </span>
                          </span>
                        </span>
                      </div>
                      <div v-if="email?.date" class="text-xs text-gray-500">
                        {{ fmtToLocalDatetime(email.date) }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="mb-1"
                    v-if="
                      email &&
                      email.recipients &&
                      email.recipients.some((r) => r.recipientType === 2)
                    "
                  >
                    <div class="flex items-center">
                      <span class="text-xs font-medium text-gray-700 mr-1"
                        >Cc:</span
                      >
                      <span class="text-xs">
                        <span
                          v-for="(recipient, index) in email.recipients.filter(
                            (r) => r.recipientType === 2
                          )"
                          :key="index"
                          class="inline-flex items-center"
                        >
                          <span v-if="index > 0" class="mx-1"> ; </span>
                          <span
                            class="inline-flex items-center text-black font-semibold"
                          >
                            {{ recipient.name }} <{{ recipient.address }}>
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div
                    class="mb-1"
                    v-if="
                      email &&
                      email.recipients &&
                      email.recipients.some((r) => r.recipientType === 3)
                    "
                  >
                    <div class="flex items-center">
                      <span class="text-xs font-medium text-gray-700 mr-1"
                        >Bcc:</span
                      >
                      <span class="text-xs">
                        <span
                          v-for="(recipient, index) in email.recipients.filter(
                            (r) => r.recipientType === 3
                          )"
                          :key="index"
                          class="inline-flex items-center"
                        >
                          <span v-if="index > 0" class="mx-1"> ; </span>
                          <span
                            class="inline-flex items-center text-black font-semibold"
                          >
                            {{ recipient.name }} <{{ recipient.address }}>
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Body -->
              <div class="bg-white p-1">
                <!-- Attachement Content -->
                <div
                  v-if="email?.hasAttachments"
                  class="attachments flex flex-wrap gap-1 p-3"
                >
                  <span
                    v-for="attachment in email?.attachments"
                    :key="attachment.id"
                  >
                    <div
                      v-if="attachment.inline != true"
                      class="flex justify-items-center items-center flex-grow-0 text-xs rounded border border-gray-200 px-3 py-2 hover:border-indigo-300 bg-white"
                    >
                      <span class="flex">
                        <document-icon
                          :extension="getFileExt(attachment.name)"
                          class="pr-2"
                        />
                      </span>
                      <span class="flex truncate" :title="attachment.name">
                        {{ attachment.name }}
                      </span>
                      <alp-options>
                        <span
                          v-if="
                            getFileExt(attachment.name) == 'pdf' ||
                            getFileExt(attachment.name) == 'png' ||
                            getFileExt(attachment.name) == 'jpg' ||
                            getFileExt(attachment.name) == 'JPG' ||
                            getFileExt(attachment.name) == 'PNG'
                          "
                          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
                          @click.stop="
                            attachment.id && previewAttachment(attachment.id)
                          "
                        >
                          Preview
                        </span>
                        <span
                          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
                          @click.stop="
                            attachment.id && downloadAttachment(attachment.id)
                          "
                        >
                          Download
                        </span>
                        <!-- <span
                          v-if="canImport"
                          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
                          @click.stop="
                            attachment.id && importAttachment(attachment.id)
                          "
                        >
                          Import
                        </span> -->
                      </alp-options>
                    </div>
                  </span>
                </div>

                <!-- Matter Content -->
                <div v-if="email?.matters && email.matters.length > 0">
                  <div
                    class="w-full p-3"
                    v-for="item in email.matters"
                    :key="item.id"
                  >
                    <span
                      class="p-2 block bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex flex-col">
                        <div
                          class="flex justify-between text-sm font-medium mb-3"
                        >
                          <router-link
                            :to="{ name: 'Matter', params: { id: item.id } }"
                            class="flex items-center group"
                            target="_blank"
                          >
                            <shad-badge
                              :class="[
                                matterBadgeColor(item?.status),
                                'mr-3 px-2 py-1 transition-colors'
                              ]"
                            >
                              {{ item.id }}
                            </shad-badge>
                            <span
                              class="font-medium text-gray-800 group-hover:text-blue-500 transition-colors"
                              >{{ item.name }}</span
                            >
                          </router-link>
                        </div>
                        <span class="text-xs">
                          <span class="flex pr-2 text-gray-600 leading-relaxed">
                            {{ item.description }}</span
                          >
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
                <!-- Email Content -->
                <div class="original-email-content p-3">
                  <iframe
                    ref="iframe"
                    class="w-full border-0 no-scrollbar"
                    sandbox="allow-same-origin allow-popups"
                    :srcdoc="email?.content || ''"
                    scrolling="no"
                    @load="resizeIFrameToFitContent"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <alp-empty
        :content="'Select an email to read'"
        :subContent="'Nothing is selected'"
        v-else-if="!state.loading"
      >
      </alp-empty>
    </div>
  </div>
  <div v-else>
    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 rounded-md">
      <div class="space-y-1 text-center">
        <img
          src="/img/svg/multi-email-selection.svg"
          alt="Mulit Email Seection"
          style="width: 200px; height: 200px"
        />
        <div class="flex-col text-base text-gray-600 text-center">
          <h1>{{ count }} Conversation Selected</h1>
          <p class="flex-1 text-black font-semibold">Action selected emails</p>

          <div
            class="flex-1 text-blue-600 text-sm font-normal justify-items-center cursor-pointer pt-2"
          >
            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="selectedEmailHide(true)"
            >
              <EyeOff class="size-4 mr-2" />
              <span>Hide </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="selectedEmailFlag(true)"
            >
              <Flag class="size-4 mr-2" />
              <span>Flag </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="selectEmailRead(true)"
            >
              <MailOpen class="size-4 mr-2" />
              <span>Mark as read </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="selectEmailRead(false)"
            >
              <Mail class="size-4 mr-2" />
              <span>Mark as unread </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="selectedEmailPin(true)"
            >
              <Pin class="size-4 mr-2" />
              <span>Pin </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click="showSelectedAssignEmailToMatterModal"
            >
              <Archive class="size-4 mr-2" />
              <span>Assign to a Matter </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click="showSelectedAssignEmailToProjectModal"
            >
              <Archive class="size-4 mr-2" />
              <span>Assign to a Project </span>
            </span>

            <span
              class="flex px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full items-center"
              @click.stop.prevent="cancelSelection"
            >
              <CircleX class="size-4 mr-2" />
              <span>Cancel </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <file-preview
    v-if="state.previewAttachment"
    :extension="state.fileExtension"
    :get-file="getDocumentFile"
    :get-url="getDocumentUrl"
    :document="state.documentFile"
    @close="state.previewAttachment = null"
  />
</template>

<script setup lang="ts">
import FileSaver from "file-saver";
import FilePreview from "@/components/common/FilePreview.vue";
import { usePreview } from "@/composable/preview";

import { ScrollArea } from "@/lib/registry/new-york/ui/scroll-area";
import {
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  MailOpen,
  Mail,
  Flag,
  Pin,
  EyeOff,
  PinOff,
  FlagOff,
  Globe,
  Archive,
  Eye,
  CircleX,
  SquareArrowDown,
  Printer
} from "lucide-vue-next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/lib/registry/new-york/ui/dropdown-menu";
import { Button } from "@/lib/registry/new-york/ui/button";
import { Separator } from "@/lib/registry/new-york/ui/separator";
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/lib/registry/new-york/ui/tooltip";
import { fmtToLocalDatetime } from "@/composable/date";
import store from "@/store";
import { EmailStore } from "@/store/modules/emails";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { SendEmailStore } from "@/store/modules/send-email";
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch
} from "vue";
import { MatterStore } from "@/store/modules/matters";
import { useNotify } from "@/composable/notify";
import { Skeleton } from "@/lib/registry/new-york/ui/skeleton";
import { ContactStore } from "@/store/modules/contacts";
import { ProjectStore } from "@/store/modules/projects";
import { OrganisationStore } from "@/store/modules/organisations";
import { DocumentDto } from "@/network/dtos/document-dto";
import {
  EmailAttachmentDto,
  EmailDto,
  EmailRecipientDto
} from "@/network/dtos/email-dto";
import { EmailRecipientType } from "@/network/dtos/enumTypes";

const props = defineProps<{
  id: string | number;
  isChecked: Boolean;
  selectedEmail: Array<Number>;
  count: Number;
  matterid?: Number;
  emailType?: String;
  entityNumber?: Number;
}>();

const state = reactive({
  previewAttachment: null as EmailAttachmentDto | null | undefined,
  fileExtension: "",
  documentFile: undefined as EmailAttachmentDto | undefined,
  loading: false,
  email: null as EmailDto | null | undefined,
  attachmentFile: undefined as DocumentDto | undefined
});

onMounted(() => {
  iframe.value?.addEventListener("load", resizeIFrameToFitContent);
});
onUnmounted(() => {
  iframe.value?.removeEventListener("load", resizeIFrameToFitContent);
});

function resizeIFrameToFitContent() {
  if (!iframe.value) return;

  try {
    const iframeDoc =
      iframe.value.contentDocument || iframe.value.contentWindow?.document;
    if (iframeDoc && iframeDoc.body) {
      // Add CSS to hide scrollbars in the iframe content
      const style = iframeDoc.createElement("style");
      style.textContent = `
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Calculate height with a larger buffer to ensure all content is visible
      const height = iframeDoc.body.scrollHeight + 50;
      iframe.value.style.height = `${height}px`;

      // Add click event listeners to all links in the iframe
      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          if (link.href) {
            window.open(link.href, "_blank");
          }
        });
      });
    }
  } catch (e) {
    console.error("Error resizing iframe:", e);
  }
}

function fetchEmail() {
  if (props.id != 0) {
    state.loading = true;

    const fetchPromise = (() => {
      if (props.emailType === "Matter") {
        return store.dispatch(MatterStore.actions.GET_MATTER_EMAIL, {
          id: props.entityNumber,
          emailId: props.id
        });
      } else if (props.emailType === "Contact") {
        return store.dispatch(ContactStore.actions.GET_CONTACT_EMAIL, {
          id: props.entityNumber,
          emailId: props.id
        });
      } else if (props.emailType === "Project") {
        return store.dispatch(ProjectStore.actions.GET_PROJECT_EMAIL, {
          id: props.entityNumber,
          emailId: props.id
        });
      } else if (props.emailType === "Organisation") {
        return store.dispatch(
          OrganisationStore.actions.GET_ORGANISATION_EMAIL,
          {
            id: props.entityNumber,
            emailId: props.id
          }
        );
      } else {
        return store.dispatch(EmailStore.actions.GET_EMAIL, {
          id: props.id
        });
      }
    })();

    fetchPromise
      .then((response) => {
        const emailData = response?.data || response;
        state.email = emailData;
      })
      .catch((error) => {
        console.error("Error fetching email:", error);
      })
      .finally(() => {
        state.loading = false;
      });
  }
}

watch([() => props.id, () => props.entityNumber, () => props.emailType], () => {
  fetchEmail();
});

const email = computed(() => {
  return state.email;
});

function changeEmailReadStatus(email: EmailDto, isRead: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_EMAIL_READ_STATUS, {
      id: email.id,
      isRead: isRead
    })
    .then(() => {
      email.isRead = isRead;
    });
}
function changeEmailFlagStatus(email: EmailDto, isFlag: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_EMAIL_FLAG_STATUS, {
      id: email.id,
      isFlag: isFlag
    })
    .then(() => {
      // Use the appropriate action based on email type
      let action;
      if (props.emailType === "Matter") {
        action = MatterStore.actions.GET_MATTER_EMAIL;
      } else if (props.emailType === "Contact") {
        action = ContactStore.actions.GET_CONTACT_EMAIL;
      } else if (props.emailType === "Project") {
        action = ProjectStore.actions.GET_PROJECT_EMAIL;
      } else if (props.emailType === "Organisation") {
        action = OrganisationStore.actions.GET_ORGANISATION_EMAIL;
      } else {
        action = EmailStore.actions.GET_EMAIL;
      }

      store.dispatch(action, {
        id: email.id
      });
    });
}
function changeEmailPinStatus(email: EmailDto, isPin: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_EMAIL_PIN_STATUS, {
      id: email.id,
      isPin: isPin
    })
    .then(() => {
      // Use the appropriate action based on email type
      let action;
      if (props.emailType === "Matter") {
        action = MatterStore.actions.GET_MATTER_EMAIL;
      } else if (props.emailType === "Contact") {
        action = ContactStore.actions.GET_CONTACT_EMAIL;
      } else if (props.emailType === "Project") {
        action = ProjectStore.actions.GET_PROJECT_EMAIL;
      } else if (props.emailType === "Organisation") {
        action = OrganisationStore.actions.GET_ORGANISATION_EMAIL;
      } else {
        action = EmailStore.actions.GET_EMAIL;
      }

      store.dispatch(action, {
        id: email.id
      });
    });
}
function hideEmail(email: EmailDto) {
  store
    .dispatch(EmailStore.actions.CHANGE_EMAIL_HIDE_STATUS, {
      id: email.id,
      isHide: !email.isHide
    })
    .then(() => {
      // Use the appropriate action based on email type
      let action;
      if (props.emailType === "Matter") {
        action = MatterStore.actions.GET_MATTER_EMAIL;
      } else if (props.emailType === "Contact") {
        action = ContactStore.actions.GET_CONTACT_EMAIL;
      } else if (props.emailType === "Project") {
        action = ProjectStore.actions.GET_PROJECT_EMAIL;
      } else if (props.emailType === "Organisation") {
        action = OrganisationStore.actions.GET_ORGANISATION_EMAIL;
      } else {
        action = EmailStore.actions.GET_EMAIL;
      }

      store.dispatch(action, {
        id: email.id
      });
    });
}
function getRecipientsContent(
  recipients: EmailRecipientDto[],
  type: EmailRecipientType
) {
  return recipients
    .filter((r) => r.recipientType === type)
    .map((r) => `${r.name} &lt;${r.address}&gt;`)
    .join("; ");
}
function processAllEmail() {
  if (!email.value) return;

  //clear email
  store.commit(SendEmailStore.mutations.CLEAR_EMAIL);
  //set message id
  store.commit(
    SendEmailStore.mutations.SET_MESSAGEID,
    email.value.messageId || ""
  );
}
function processThreadEmail() {
  if (!email.value) return;

  let emailContent = "";
  let emailDateTime = fmtToLocalDatetime(email.value.date);

  //build email head
  var emailForwardHead = `
    <br/>
    <div style="border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px;">
      <p><strong>From:</strong> ${email.value.senderName || ""} &lt;${
    email.value.senderAddress || ""
  }&gt;</p>
      <p><strong>Sent:</strong> ${emailDateTime}</p>
      <p><strong>To:</strong> ${getRecipientsContent(
        email.value.recipients || [],
        EmailRecipientType.To
      )}</p>
      ${
        getRecipientsContent(
          email.value.recipients || [],
          EmailRecipientType.Cc
        )
          ? `<p><strong>Cc:</strong> ${getRecipientsContent(
              email.value.recipients || [],
              EmailRecipientType.Cc
            )}</p>`
          : ""
      }
      <p><strong>Subject:</strong> ${email.value.subject || ""}</p>
    </div>
    <br/>`;

  //add original email content
  emailContent = emailForwardHead + (email.value.content || "");

  //set email content
  store.commit(SendEmailStore.mutations.SET_THREAD_EMAIL_CONTENT, emailContent);
}
function emailReplyClick() {
  if (!email.value) return;

  processAllEmail();
  processThreadEmail();

  //set email to as original sender
  if (email.value.senderAddress) {
    store.commit(SendEmailStore.mutations.SET_TO, [email.value.senderAddress]);
  }

  //set email subject
  store.commit(
    SendEmailStore.mutations.SET_SUBJECT,
    `RE: ${email.value.subject || ""}`
  );
  store.commit(SendEmailStore.mutations.SET_IS_REPLY, true);
  store.commit(SendEmailStore.mutations.EMAIL_MODAL_OPEN);
}

function emailReplyAllClick() {
  if (!email.value) return;

  processAllEmail();
  processThreadEmail();

  const toEmails: string[] = [];
  const ccEmails: string[] = [];

  //add original sender to to list
  if (email.value.senderAddress) {
    toEmails.push(email.value.senderAddress);
  }

  //add all recipients and cc to list
  email.value.recipients?.forEach((recipient) => {
    if (!recipient.address) return;

    if (recipient.recipientType === EmailRecipientType.To) {
      toEmails.push(recipient.address);
    } else if (recipient.recipientType === EmailRecipientType.Cc) {
      ccEmails.push(recipient.address);
    }
  });

  //set to and cc to list
  store.commit(SendEmailStore.mutations.SET_TO, toEmails);
  store.commit(SendEmailStore.mutations.SET_CC, ccEmails);

  //set email subject
  store.commit(
    SendEmailStore.mutations.SET_SUBJECT,
    `RE: ${email.value.subject || ""}`
  );
  store.commit(SendEmailStore.mutations.SET_IS_REPLY_ALL, true);
  store.commit(SendEmailStore.mutations.EMAIL_SET_CC_OPEN);
  store.commit(SendEmailStore.mutations.EMAIL_MODAL_OPEN);
}
function emailForwardClick() {
  if (!email.value) return;

  processAllEmail();
  processThreadEmail();

  //set email subject
  store.commit(
    SendEmailStore.mutations.SET_SUBJECT,
    `FWD: ${email.value.subject || ""}`
  );

  //process attachments
  const emailAttachments = email.value.attachments || [];
  store.commit(SendEmailStore.mutations.SET_ATTACHMENTS, emailAttachments);

  store.commit(SendEmailStore.mutations.SET_IS_FORWARD, true);
  store.commit(SendEmailStore.mutations.EMAIL_MODAL_OPEN);
}
function showAssignEmailToMatterModal() {
  if (email.value?.id != undefined) {
    let ids: number[] = [email.value.id];
    store.dispatch(ModalStore.actions.SHOW_MODAL, {
      modal: ModalType.AssignEmailToMatter,
      props: {
        emailIdList: ids,
        selectEmailId: email.value.id
      }
    });
  }
}
function showAssignEmailToProjectModal() {
  if (email.value?.id != undefined) {
    let ids: number[] = [email.value.id];
    store.dispatch(ModalStore.actions.SHOW_MODAL, {
      modal: ModalType.AssignEmailToProject,
      props: {
        emailIdList: ids
      }
    });
  }
}
function getInitial(name: any) {
  const nameParts = name.split(" ");
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}
function matterBadgeColor(matterBadgeColor: any) {
  switch (matterBadgeColor) {
    case 1:
      return `bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900 group-hover:bg-yellow-100 group-hover:text-yellow-800`;
    case 2:
      return `bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900 group-hover:bg-yellow-100 group-hover:text-yellow-800`;
    case 3:
      return `bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900 group-hover:bg-green-100 group-hover:text-green-800`;
    case 4:
      return `bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 group-hover:bg-blue-100 group-hover:text-blue-800`;
    case 5:
      return `bg-indigo-100 text-indigo-800 dark:bg-indigo-200 dark:text-indigo-900 group-hover:bg-indigo-100 group-hover:text-indigo-800`;
    case 6:
      return `bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900 group-hover:bg-gray-100 group-hover:text-gray-800`;
    default:
      return `bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900 group-hover:bg-gray-100 group-hover:text-gray-800`;
  }
}
function selectedEmailHide(isHide: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_SELECT_EMAIL_HIDE, {
      id: props.selectedEmail,
      isHide: isHide
    })
    .then(() => {
      store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
    });
}
function selectedEmailFlag(isFlag: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_SELECT_EMAIL_FLAG, {
      id: props.selectedEmail,
      isFlag: isFlag
    })
    .then(() => {
      store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
    });
}
function selectEmailRead(isRead: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_SELECT_EMAIL_READ, {
      id: props.selectedEmail,
      isRead: isRead
    })
    .then(() => {
      store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
    });
}
function selectedEmailPin(isPin: boolean) {
  store
    .dispatch(EmailStore.actions.CHANGE_SELECT_EMAIL_PIN, {
      id: props.selectedEmail,
      isPin: isPin
    })
    .then(() => {
      store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
    });
}
function cancelSelection() {
  store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
}

function showSelectedAssignEmailToMatterModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.AssignEmailToMatter,
    props: {
      emailIdList: props.selectedEmail
    }
  });
}
function showSelectedAssignEmailToProjectModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.AssignEmailToProject,
    props: {
      emailIdList: props.selectedEmail
    }
  });
}
function getFileExt(attachmentName: String | undefined) {
  if (!attachmentName) return "";
  return attachmentName.substring(attachmentName.lastIndexOf(".") + 1);
}

const { fireSuccessToast } = useNotify();

function printEmail() {
  if (!email.value) return;

  // Helper for safe HTML escaping
  const escape = (str: string) =>
    String(str || "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, '&quot;')
      .replace(/'/g, "&#39;");

  // Inline SVG for attachment icon
  const attachmentIcon = `<svg style=\"vertical-align:middle;margin-right:4px\" width=\"16\" height=\"16\" fill=\"#666\" viewBox=\"0 0 24 24\"><path d=\"M17.657 6.343a8 8 0 0 0-11.314 0l-1.414 1.414a6 6 0 0 0 8.485 8.485l4.243-4.243a4 4 0 1 0-5.657-5.657l-4.243 4.243a2 2 0 1 0 2.828 2.828l4.243-4.243\" stroke=\"#666\" stroke-width=\"2\" fill=\"none\"/></svg>`;

  // Format attachments
  let attachmentsHtml = '';
  if (email.value.attachments && email.value.attachments.length > 0) {
    attachmentsHtml = `
      <div class=\"attachments\" style=\"margin:12px 0 0 0;padding:12px 0 0 0;border-top:1px solid #eee;\">
        <div style=\"font-size:13px;color:#444;margin-bottom:6px;\">${email.value.attachments.length} attachment${email.value.attachments.length > 1 ? 's' : ''}</div>
        ${email.value.attachments
          .map(
            (a) =>
              `<div style=\"display:flex;align-items:center;font-size:13px;margin-bottom:2px;\">${attachmentIcon}<span>${escape(
                a.name || ''
              )}${a.size ? ` (${(a.size / 1024).toFixed(0)} KB)` : ''}</span></div>`
          )
          .join('')}
      </div>
    `;
  }

  // Recipients
  const toRecipients = email.value.recipients
    ? email.value.recipients
        .filter((r) => r.recipientType === 1)
        .map((r) => `${escape(r.name || '')} &lt;${escape(r.address || '')}&gt;`)
        .join('; ')
    : '-';
  const ccRecipients = email.value.recipients
    ? email.value.recipients
        .filter((r) => r.recipientType === 2)
        .map((r) => `${escape(r.name || '')} &lt;${escape(r.address || '')}&gt;`)
        .join('; ')
    : '';

  // Print content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escape(email.value.subject || '') || 'No Subject'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #222;
          margin: 0;
          padding: 0;
        }
        .print-header {
          border-bottom: 2px solid #e0e0e0;
          padding: 24px 40px 12px 40px;
          background: #f8f9fa;
        }
        .print-subject {
          font-size: 18px;
          font-weight: bold;
          color: #222;
          margin-bottom: 8px;
        }
        .print-meta {
          font-size: 13px;
          color: #444;
          margin-bottom: 8px;
        }
        .print-meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .print-meta-table td {
          padding: 2px 8px 2px 0;
          font-size: 13px;
          color: #444;
        }
        .print-body {
          padding: 32px 40px 24px 40px;
        }
        .attachments {
          margin-top: 16px;
        }
        .print-branding {
          margin: 40px 0 0 0;
          padding: 0 40px 24px 40px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
        }
        .print-branding img {
          height: 48px;
          margin-right: 16px;
        }
        .print-branding .tagline {
          font-size: 15px;
          color: #444;
          font-weight: 500;
        }
        .print-footer {
          display: none;
        }
        a { color: #1a0dab; text-decoration: underline; }
        @media print {
          .print-footer { display: none; }
          @page { margin: 0.5in 0.5in 0.7in 0.5in; }
          body { margin: 0; }
          .print-header, .print-body, .print-branding { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class=\"print-header\">
        <div class=\"print-subject\">${escape(email.value.subject || '') || 'No Subject'}</div>
        <table class=\"print-meta-table\">
          <tr>
            <td><b>From</b></td>
            <td>${escape(email.value.senderName || '')} &lt;${escape(email.value.senderAddress || '')}&gt;</td>
          </tr>
          <tr>
            <td><b>Date</b></td>
            <td>${email.value.date ? fmtToLocalDatetime(email.value.date) : '-'}</td>
          </tr>
          <tr>
            <td><b>To</b></td>
            <td>${toRecipients || '-'}</td>
          </tr>
          ${ccRecipients ? `<tr><td><b>Cc</b></td><td>${ccRecipients}</td></tr>` : ''}
        </table>
        ${attachmentsHtml}
      </div>
      <div class=\"print-body\">
        ${email.value.content || '<i>No content</i>'}
      </div>

      <div class=\"print-footer\"></div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.onload = function() {
    printWindow.print();
    printWindow.close();
  };
}

function ExportEmailToPDF() {
  switch (props.emailType) {
    case "Matter":
      {
        store
          .dispatch(EmailStore.actions.EXPORT_MATTER_EMAIL_AS_PDF, {
            entityNumber: props.entityNumber,
            id: email.value?.id
          })
          .then(() => {
            fireSuccessToast(
              "Request has been send out to backend, please check back later at documents !"
            );
          });
      }
      break;
    case "Contact":
      {
        store
          .dispatch(EmailStore.actions.EXPORT_CONTACT_EMAIL_AS_PDF, {
            entityNumber: props.entityNumber,
            id: email.value?.id
          })
          .then(() => {
            fireSuccessToast(
              "Request has been send out to backend, please check back later at documents !"
            );
          });
      }
      break;
  }
}

const iframe = ref<HTMLIFrameElement | null>(null);

watch(
  [() => props.count],
  () => {
    store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, false);
  },
  { immediate: true, deep: true }
);
onMounted(fetchEmail);
function downloadAttachment(id: number) {
  store
    .dispatch(EmailStore.actions.GET_ATTACHMENT_LINK, {
      id: props.id,
      attachmentId: id
    })
    .then((response) => {
      FileSaver.saveAs(response);
    });
}
function previewAttachment(id: number) {
  state.previewAttachment = email.value?.attachments?.find((a) => a.id == id);

  if (state.previewAttachment) {
    state.fileExtension = state.previewAttachment.name?.split(".").pop() as any;
    const document = new DocumentDto();
    document.id = id;
    document.fileName = state.previewAttachment.name;
    document.fileExtension = state.previewAttachment.name?.split(".").pop() as any;
    state.documentFile = document;
  }

  // get attachment file
  store
    .dispatch(EmailStore.actions.DOWNLOAD_ATTACHMENT, {
      id: props.id,
      attachmentId: state.previewAttachment?.id
    })
    .then((response) => {
      state.attachmentFile = response.data;
    });
}


function getDocumentUrl() {
  return store.dispatch(EmailStore.actions.GET_ATTACHMENT_LINK, {
    id: props.id,
    attachmentId: state.previewAttachment?.id
  });
}

function getDocumentFile() {
  return store.dispatch(EmailStore.actions.DOWNLOAD_ATTACHMENT, {
    id: props.id,
    attachmentId: state.previewAttachment?.id
  });
}

const { toExtension } = usePreview();
</script>

<style>
.mail-content {
  height: calc(100vh - 420px);
}

.original-email-content iframe {
  min-height: 200px;
  overflow: hidden;
  width: 100%;
  scrollbar-width: none; /* Firefox */
}

.original-email-content iframe::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
