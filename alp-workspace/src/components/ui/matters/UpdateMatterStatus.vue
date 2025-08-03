<template>
  <modal @close="$emit('close')" :headingTitle="'Update Matter Status'">
    <div class="flex flex-col bg-white">
      <div class="py-4">
        <!-- Status Flow Stepper -->
        <div class="flex w-full items-center gap-2 px-4">
          <template v-if="currentStatus === MatterStatus.Lost">
            <!-- Show only three steps when matter is Lost -->
            <div class="flex flex-col items-center flex-grow">
              <shad-button
                variant="outline"
                :class="[
                  'rounded-full h-10 w-10 p-0 transition-colors duration-300',
                  'bg-green-500 text-white opacity-50'
                ]"
                :disabled="true"
                @click.prevent.stop=""
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </shad-button>
              <div class="text-xs mt-2 font-semibold text-muted-foreground">
                To Be Quoted
              </div>
            </div>

            <div class="flex-1 h-1 rounded bg-green-500 opacity-50"></div>

            <div class="flex flex-col items-center flex-grow">
              <shad-button
                variant="outline"
                :class="[
                  'rounded-full h-10 w-10 p-0 transition-colors duration-300',
                  'bg-green-500 text-white opacity-50'
                ]"
                :disabled="true"
                @click.prevent.stop=""
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </shad-button>
              <div class="text-xs mt-2 font-semibold text-muted-foreground">
                Quoted
              </div>
            </div>

            <div class="flex-1 h-1 rounded bg-red-500"></div>

            <div class="flex flex-col items-center flex-grow">
              <div
                class="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-red-500 text-white"
              >
                <iconify-icon icon="lucide:x" class="h-4 w-4" />
              </div>
              <div class="text-xs mt-2 font-semibold">Lost</div>
            </div>
          </template>
          <template v-else-if="currentStatus === MatterStatus.Closed">
            <!-- Special template for Closed status -->
            <div class="flex flex-col items-center flex-grow">
              <shad-button
                variant="outline"
                class="rounded-full h-10 w-10 p-0 transition-colors duration-300 bg-green-500 text-white opacity-50"
                :disabled="true"
                @click.prevent.stop=""
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </shad-button>
              <div class="text-xs mt-2 font-semibold text-muted-foreground">
                To Be Quoted
              </div>
            </div>

            <div class="flex-1 h-1 rounded bg-green-500 opacity-50"></div>

            <div class="flex flex-col items-center flex-grow">
              <shad-button
                variant="outline"
                class="rounded-full h-10 w-10 p-0 transition-colors duration-300 bg-green-500 text-white opacity-50"
                :disabled="true"
                @click.prevent.stop=""
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </shad-button>
              <div class="text-xs mt-2 font-semibold text-muted-foreground">
                Quoted
              </div>
            </div>

            <div class="flex-1 h-1 rounded bg-green-500 opacity-50"></div>

            <div class="flex flex-col items-center flex-grow">
              <shad-button
                variant="outline"
                class="rounded-full h-10 w-10 p-0 transition-colors duration-300 bg-green-500 text-white opacity-50"
                :disabled="true"
                @click.prevent.stop=""
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </shad-button>
              <div class="text-xs mt-2 font-semibold text-muted-foreground">
                Open
              </div>
            </div>

            <div class="flex-1 h-1 rounded bg-green-500"></div>

            <div class="flex flex-col items-center flex-grow">
              <div
                class="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-green-500 text-white"
              >
                <iconify-icon icon="lucide:check" class="h-4 w-4" />
              </div>
              <div class="text-xs mt-2 font-semibold">Closed</div>
            </div>
          </template>
          <template
            v-else
            v-for="(status, index) in statusSteps"
            :key="status.value"
          >
            <div class="flex flex-col items-center flex-grow">
              <div
                v-if="currentStatus === status.value"
                class="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-green-500 text-white"
              >
                <iconify-icon
                  v-if="currentStatusIndex >= index"
                  icon="lucide:check"
                  class="h-4 w-4"
                />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <shad-button
                v-else
                variant="outline"
                :class="[
                  'rounded-full h-10 w-10 p-0 transition-colors duration-300',
                  currentStatus && currentStatus > status.value
                    ? 'bg-green-500 text-white opacity-50'
                    : ''
                ]"
                :disabled="true"
                @click.prevent.stop=""
              >
                <span v-if="currentStatusIndex >= index">
                  <iconify-icon icon="lucide:check" class="h-4 w-4" />
                </span>
                <span v-else>{{ index + 1 }}</span>
              </shad-button>

              <div
                :class="[
                  'text-xs mt-2 font-semibold',
                  currentStatus !== status.value ? 'text-muted-foreground' : ''
                ]"
              >
                {{ status.label }}
              </div>
            </div>

            <!-- Add separator between steps -->
            <div
              v-if="index < statusSteps.length - 1"
              :class="[
                'flex-1 h-1 rounded relative overflow-hidden',
                currentStatusIndex > index
                  ? 'bg-green-500 opacity-50'
                  : currentStatus === status.value &&
                    status.value === MatterStatus.Open &&
                    index === 2
                  ? ''
                  : currentStatus === status.value &&
                    index < statusSteps.length - 2
                  ? ''
                  : 'bg-muted',
                currentStatus === status.value &&
                index === statusSteps.length - 2 &&
                status.value !== MatterStatus.Open
                  ? 'bg-green-500'
                  : ''
              ]"
            >
              <div
                v-if="
                  (currentStatus === status.value &&
                    status.value === MatterStatus.Open &&
                    index === 2) ||
                  (currentStatus === status.value &&
                    index < statusSteps.length - 2 &&
                    status.value !== MatterStatus.Open)
                "
                class="absolute inset-y-0 left-0 bg-green-500 flow-right-animation h-full w-0"
              ></div>
            </div>
          </template>
        </div>
      </div>

      <div class="px-4 mt-4">
        <p class="text-muted-foreground mb-4">
          {{ getStatusDescription(currentStatus) }}
        </p>
      </div>

      <div class="self-center flex items-center max-w-2xl py-6">
        <div class="flex flex-wrap gap-3 text-sm justify-center">
          <template v-if="currentStatus == MatterStatus.ToBeQuoted">
            <div class="space-y-4 w-full max-w-md">
              <p class="text-base font-medium text-center">
                Have you provided the client with a work proposal or a quote?
              </p>

              <div
                class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                @click="confirmMarkAsQuoted"
              >
                <iconify-icon
                  icon="lucide:check-circle"
                  class="mt-px h-5 w-5 text-green-600"
                />
                <div class="space-y-1">
                  <p class="text-sm text-black font-medium leading-none">
                    Yes, Mark as Quoted
                  </p>
                  <p class="text-sm text-muted-foreground">
                    The quote has been provided to the client and is awaiting
                    acceptance.
                  </p>
                </div>
              </div>

              <Popover
                :open="showLostPopover"
                @update:open="showLostPopover = $event"
              >
                <PopoverTrigger asChild>
                  <div
                    class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                  >
                    <iconify-icon
                      icon="lucide:x-circle"
                      class="mt-px h-5 w-5 text-red-600"
                    />
                    <div class="space-y-1">
                      <p class="text-sm text-black font-medium leading-none">
                        No, Mark as Lost
                      </p>
                      <p class="text-sm text-muted-foreground">
                        The client has declined the quote or the matter has been
                        cancelled. All WIP time will be moved into Sales Time.
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent class="w-[450px]">
                  <div class="text-center">
                    <h4 class="font-medium mb-2">
                      The reason for matter loss?
                    </h4>
                    <p class="text-sm text-muted-foreground mb-4">
                      Choose the reason for matter loss
                    </p>

                    <!-- Matter Lost Reason -->
                    <input
                      type="text"
                      v-model="matterLostReason"
                      class="w-full p-2 border rounded-md mb-4"
                      placeholder="Enter reason for matter loss"
                      hidden
                    />

                    <div class="flex flex-wrap gap-2 mb-4">
                      <shad-badge
                        v-for="reason in matterLostReasons"
                        :key="reason"
                        :variant="
                          matterLostReason === reason
                            ? 'destructive'
                            : 'outline'
                        "
                        class="cursor-pointer"
                        @click="selectMatterLostReason(reason)"
                      >
                        {{ reason }}
                      </shad-badge>
                    </div>

                    <div class="flex justify-center space-x-3">
                      <shad-button
                        variant="outline"
                        size="sm"
                        @click="showLostPopover = false"
                      >
                        Cancel
                      </shad-button>
                      <shad-button
                        variant="default"
                        size="sm"
                        @click="confirmMarkAsLost"
                        class="bg-green-500 hover:bg-green-600"
                      >
                        Confirm
                      </shad-button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </template>

          <template
            v-if="currentStatus == MatterStatus.QuotedAwaitingAcceptance"
          >
            <div class="space-y-4 w-full max-w-md">
              <p class="text-base font-medium text-center">
                Has the client accepted the quote?
              </p>

              <Popover
                :open="showConfirmOpenPopover"
                @update:open="showConfirmOpenPopover = $event"
              >
                <PopoverTrigger asChild>
                  <div
                    class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                  >
                    <iconify-icon
                      icon="lucide:check-circle"
                      class="mt-px h-5 w-5 text-green-600"
                    />
                    <div class="space-y-1">
                      <p class="text-sm text-black font-medium leading-none">
                        Yes, Mark as Won
                      </p>
                      <p class="text-sm text-muted-foreground">
                        The client has accepted the quote and work can begin.
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent class="w-[450px]">
                  <div class="">
                    <h4 class="font-medium mb-2">Confirm Matter Details</h4>
                    <p class="text-sm text-muted-foreground mb-4">
                      Please confirm the following details before marking as
                      won:
                    </p>

                    <div class="space-y-4 mb-4">
                      <!-- Estimated Budget -->
                      <field-label
                        class="w-full"
                        name="Estimated Budget"
                        :isRequired="true"
                      >
                        <inline-input
                          type="number"
                          name="estimatedBudget"
                          v-model="state.estimatedBudget"
                          placeholder="Enter estimated budget"
                          rules="required"
                        />
                      </field-label>

                      <!-- Expected Work Delivery Date -->
                      <field-label
                        class="w-full"
                        name="Expected Work Delivery Date"
                      >
                        <date-field
                          width="w-full"
                          name="expectedWorkDeliveryDate"
                          placeholder="Expected Work Delivery Date"
                          v-model="state.estimatedClosingDate"
                        />
                      </field-label>
                    </div>

                    <div class="flex justify-center space-x-3">
                      <shad-button
                        variant="outline"
                        size="sm"
                        @click="showConfirmOpenPopover = false"
                      >
                        Cancel
                      </shad-button>
                      <shad-button
                        variant="default"
                        size="sm"
                        @click="confirmMarkAsOpen"
                        class="bg-green-500 hover:bg-green-600"
                      >
                        Confirm
                      </shad-button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover
                :open="showLostPopover"
                @update:open="showLostPopover = $event"
              >
                <PopoverTrigger asChild>
                  <div
                    class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                  >
                    <iconify-icon
                      icon="lucide:x-circle"
                      class="mt-px h-5 w-5 text-red-600"
                    />
                    <div class="space-y-1">
                      <p class="text-sm text-black font-medium leading-none">
                        No, Mark as Lost
                      </p>
                      <p class="text-sm text-muted-foreground">
                        The client has declined the quote or the matter has been
                        cancelled. All WIP time will be moved into Sales Time.
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent class="w-[450px]">
                  <div class="">
                    <h4 class="font-medium mb-2">
                      The reason for matter loss?
                    </h4>
                    <p class="text-sm text-muted-foreground mb-4">
                      Choose the reason for matter loss
                    </p>
                    <!-- Matter Lost Reason -->
                    <input
                      type="text"
                      v-model="matterLostReason"
                      class="w-full p-2 border rounded-md mb-4"
                      placeholder="Enter reason for matter loss"
                      hidden
                    />
                    <div class="flex flex-wrap gap-2 mb-4">
                      <shad-badge
                        v-for="reason in matterLostReasons"
                        :key="reason"
                        :variant="
                          matterLostReason === reason
                            ? 'destructive'
                            : 'outline'
                        "
                        class="cursor-pointer"
                        @click="selectMatterLostReason(reason)"
                      >
                        {{ reason }}
                      </shad-badge>
                    </div>
                    <div class="flex justify-center space-x-3">
                      <shad-button
                        variant="outline"
                        size="sm"
                        @click="showLostPopover = false"
                      >
                        Cancel
                      </shad-button>
                      <shad-button
                        variant="default"
                        size="sm"
                        @click="confirmMarkAsLost"
                        class="bg-green-500 hover:bg-green-600"
                      >
                        Confirm
                      </shad-button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </template>

          <template v-if="currentStatus == MatterStatus.Lost">
            <div class="space-y-4 w-full max-w-md">
              <p class="text-base font-medium text-center">
                Do you want to reopen this lost matter?
              </p>

              <blockquote
                class="mt-6 border-l-2 pl-6 italic"
                v-if="state?.matterLostReason"
              >
                The last reason recorded for losing this matter was:
                <span class="font-bold text-red-600">
                  {{ state?.matterLostReason }}
                </span>
              </blockquote>

              <div
                class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                @click="confirmReopenMatter"
              >
                <iconify-icon
                  icon="lucide:rotate-cw"
                  class="mt-px h-5 w-5 text-blue-600"
                />
                <div class="space-y-1">
                  <p class="text-sm text-black font-medium leading-none">
                    Reopen Matter
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Reopen the matter and continue work.
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template v-if="currentStatus == MatterStatus.Open">
            <!-- Trust Account Balance Card -->
            <div class="mt-4 w-full mx-auto bg-white rounded border p-3">
              <div class="flex items-center">
                <iconify-icon
                  v-if="
                    !trustBalance || trustBalance.trustAccountTotalBalance === 0
                  "
                  icon="lucide:check-circle"
                  class="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                />
                <iconify-icon
                  v-else
                  icon="lucide:x-circle"
                  class="h-5 w-5 text-red-600 mr-2 flex-shrink-0"
                />
                <div class="w-full">
                  <div class="flex items-baseline">
                    <span class="text-sm font-medium mr-2"
                      >Trust Account Balance:</span
                    >
                    <span class="text-sm font-bold">{{
                      fmtCurrency(trustBalance?.trustAccountTotalBalance) || 0
                    }}</span>
                  </div>
                  <p
                    v-if="
                      trustBalance && trustBalance.trustAccountTotalBalance > 0
                    "
                    class="text-xs text-red-600 mt-0.5"
                  >
                    You have funds or pending requests in the trust account,
                    please clear before closing the matter!
                  </p>
                  <p v-else class="text-xs text-green-600 mt-0.5">
                    Trust account is clear. No action needed.
                  </p>
                </div>
              </div>
            </div>

            <!-- WIP Balance Card -->
            <div class="mt-2 w-full mx-auto bg-white rounded border p-3">
              <div class="flex items-center">
                <iconify-icon
                  v-if="
                    !matterOverview ||
                    matterOverview.totalUnBilledTimeValue === 0
                  "
                  icon="lucide:check-circle"
                  class="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                />
                <iconify-icon
                  v-else
                  icon="lucide:x-circle"
                  class="h-5 w-5 text-red-600 mr-2 flex-shrink-0"
                />
                <div class="w-full">
                  <div class="flex items-baseline">
                    <span class="text-sm font-medium mr-2">WIP Balance:</span>
                    <span class="text-sm font-bold">{{
                      fmtCurrency(matterOverview?.totalUnBilledTimeValue) || 0
                    }}</span>
                  </div>
                  <p
                    v-if="
                      matterOverview &&
                      matterOverview.totalUnBilledTimeValue > 0
                    "
                    class="text-xs text-red-600 mt-0.5"
                  >
                    You have WIP balance, please invoice all WIP before closing
                    the matter!
                  </p>
                  <p v-else class="text-xs text-green-600 mt-0.5">
                    WIP balance is clear. No action needed.
                  </p>
                </div>
              </div>
            </div>
            <!--Inovice Should be all Sent-->

            <div class="mt-2 w-full mx-auto bg-white rounded border p-3">
              <div class="flex items-center">
                <iconify-icon
                  v-if="
                    !matterOverview ||
                    matterOverview?.totalInvoiceValueInDraft +
                      matterOverview?.totalInvoiceValueInAwaitingApproval +
                      matterOverview?.totalInvoiceValueInApproved ===
                      0
                  "
                  icon="lucide:check-circle"
                  class="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                />
                <iconify-icon
                  v-else
                  icon="lucide:x-circle"
                  class="h-5 w-5 text-red-600 mr-2 flex-shrink-0"
                />
                <div class="w-full">
                  <div class="flex items-baseline">
                    <span class="text-sm font-medium mr-2"
                      >Invoice not sent Balance:</span
                    >
                    <span class="text-sm font-bold">{{
                      fmtCurrency(
                        matterOverview?.totalInvoiceValueInDraft +
                          matterOverview?.totalInvoiceValueInAwaitingApproval +
                          matterOverview?.totalInvoiceValueInApproved
                      ) || 0
                    }}</span>
                  </div>
                  <p
                    v-if="
                      !matterOverview ||
                      matterOverview?.totalInvoiceValueInDraft +
                        matterOverview?.totalInvoiceValueInAwaitingApproval +
                        matterOverview?.totalInvoiceValueInApproved ===
                        0
                    "
                    class="text-xs text-green-600 mt-0.5"
                  >
                    All Invoices are Sent. No action needed.
                  </p>
                  <p v-else class="text-xs text-red-600 mt-0.5">
                    You have Invoices not sent, please send all Invoices before
                    closing the matter!
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4 w-full max-w-md">
              <p
                v-if="canCloseMatter"
                class="text-base font-medium text-center"
              >
                Has the matter finished?
              </p>
              <div
                v-if="!canCloseMatter"
                class="p-4 bg-gray-50 rounded-lg text-center text-sm"
              >
                <p class="text-orange-600 font-medium">
                  Cannot close matter yet
                </p>
                <p class="text-muted-foreground mt-1">
                  Please resolve all balance issues above before closing the
                  matter.
                </p>
              </div>
              <Popover
                v-if="canCloseMatter"
                :open="showClosedPopover"
                @update:open="showClosedPopover = $event"
              >
                <PopoverTrigger asChild>
                  <div
                    class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                  >
                    <iconify-icon
                      icon="lucide:check-circle"
                      class="mt-px h-5 w-5 text-green-600"
                    />
                    <div class="space-y-1">
                      <p class="text-sm text-black font-medium leading-none">
                        Yes, Close Matter
                      </p>
                      <p class="text-sm text-muted-foreground">
                        The Matter work has been completed.
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent class="w-[600px]">
                  <div class="">
                    <h4 class="font-medium mb-2">Confirm Action</h4>
                    <p class="text-sm text-muted-foreground mb-2">
                      Before closing, please confirm:
                    </p>

                    <!-- Optimized Checklist with Checkboxes -->
                    <div
                      class="bg-gray-50 border rounded p-3 mb-4 text-left space-y-2"
                    >
                      <div
                        v-for="(item, index) in closingChecklistItems"
                        :key="index"
                        class="flex items-start gap-2"
                      >
                        <input
                          type="checkbox"
                          :id="`closing-checklist-${index}`"
                          :checked="!!closingChecklist[item.id]"
                          @change="(e) => toggleChecklistItem(item.id, e)"
                          class="mt-1"
                        />
                        <label
                          :for="`closing-checklist-${index}`"
                          class="text-sm flex items-center"
                        >
                          <span>{{ item.label }}</span>
                          <a
                            v-if="item.id === 'workProposal'"
                            href="#"
                            class="text-blue-500 hover:underline ml-1 inline-flex items-center"
                            @click.prevent="openSharePointFolder"
                          >
                            <iconify-icon
                              icon="lucide:folder-open"
                              class="h-4 w-4 ml-2"
                            />
                          </a>
                          <router-link
                            v-if="item.id === 'lastNote'"
                            :to="{
                              name: 'Matter Notes',
                              params: { id: props.id }
                            }"
                            target="_blank"
                            @click=""
                          >
                            <span
                              class="text-blue-500 hover:underline ml-1 inline-flex items-center cursor-pointer"
                            >
                              <iconify-icon
                                icon="lucide:notebook-pen"
                                class="h-4 w-4 ml-2"
                              />
                            </span>
                          </router-link>
                          <a
                            v-if="item.id === 'emailReferrer'"
                            href="#"
                            class="text-blue-500 hover:underline ml-1 inline-flex items-center"
                            @click.prevent="sendReferrerThankYouEmail"
                          >
                            <iconify-icon
                              icon="lucide:mail"
                              class="h-4 w-4 ml-2"
                            />
                          </a>
                          <a
                            v-if="item.id === 'clientEmail'"
                            href="#"
                            class="text-blue-500 hover:underline ml-1 inline-flex items-center"
                            @click.prevent="sendMatterCloseEmail"
                          >
                            <iconify-icon
                              icon="lucide:mail"
                              class="h-4 w-4 ml-2"
                            />
                          </a>
                        </label>
                      </div>
                    </div>

                    <div class="flex justify-center space-x-3">
                      <shad-button
                        variant="outline"
                        size="sm"
                        @click="showClosedPopover = false"
                      >
                        Cancel
                      </shad-button>
                      <shad-button
                        variant="default"
                        size="sm"
                        @click="confirmMarkAsClosed"
                      >
                        Confirm
                      </shad-button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </template>

          <template v-if="currentStatus == MatterStatus.Closed">
            <div class="space-y-4 w-full max-w-md">
              <p class="text-base font-medium text-center">
                Do you want to reopen this closed matter?
              </p>

              <div
                class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50 cursor-pointer"
                @click="confirmReopenClosedMatter"
              >
                <iconify-icon
                  icon="lucide:rotate-cw"
                  class="mt-px h-5 w-5 text-blue-600"
                />
                <div class="space-y-1">
                  <p class="text-sm text-black font-medium leading-none">
                    Reopen Matter
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Reopen the matter and continue work.
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template v-if="currentStatus == MatterStatus.Finalised">
            <div class="space-y-4 w-full max-w-md text-center">
              <div
                class="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full"
              >
                <iconify-icon icon="lucide:check" class="w-8 h-8" />
              </div>
              <div class="text-lg font-semibold">
                Matter has been finalised. Good job!
              </div>
              <p class="text-sm text-muted-foreground">
                This matter is now archived and no further actions are required.
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import { useNotify } from "@/composable/notify";
import { MatterStore } from "@/store/modules/matters";
import { TrustStore } from "@/store/modules/trust";
import { ApiStore } from "@/store/utils";
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import confetti from "canvas-confetti";
import { fmtCurrency } from "@/composable/currency";
import { Badge as ShadBadge } from "@/lib/registry/new-york/ui/badge";
import { usePatchable } from "@/composable/patchable";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import { SendEmailStore } from "@/store/modules/send-email";
import { MatterStatus } from "@/network/dtos/enumTypes";
import { MatterDto, MatterOverviewDto } from "@/network/dtos/matter-dto";
import { MatterTrustSummaryDto } from "@/network/dtos/trust-dto";

const props = defineProps<{
  id: string | number;
}>();

const emit = defineEmits(["close"]);

const store = useStore();
const router = useRouter();
const showLostPopover = ref(false);
const showReopenPopover = ref(false);
const showReopenClosedPopover = ref(false);
const showClosedPopover = ref(false);
const showConfirmOpenPopover = ref(false);
const matterLostReason = ref("");
const matterLostReasons = ref([
  "Client chose another firm",
  "Client decided not to proceed",
  "Unable to contact clients/ unresponsive",
  "Conflict of interest identified",
  "Outside of our area of expertise",
  "Duplicate enquiry",
  "Unable to meet client timeline",
  "Quote not accepted",
  "Referred to another firm",
  "Failed KYC check"
]);

// Checklist items for matter closing
const closingChecklistItems = ref([
  { id: "workProposal", label: "Work Proposal / Quote saved on file" },
  { id: "emailReferrer", label: "Email thank you to the referrer" },
  { id: "lastNote", label: "Generate a last note" },
  {
    id: "clientEmail",
    label: "Generate a matter close email to client (or a google review email)"
  },
  {
    id: "contactDetails",
    label: "Check Contact and Organisation details are completed and up to date"
  },
  {
    id: "relationships",
    label:
      "Check contact Relationships have been updated (important for estate planning matters)"
  }
]);

// Object to track the checked state of each item
const closingChecklist = ref<Record<string, boolean>>({});
const isUpdatingChecklist = ref(false); // Flag to prevent simultaneous updates

// Load saved checklist data when matter is loaded
function loadClosingChecklist() {
  if (isUpdatingChecklist.value) return;

  if (!state.value?.matterClosedCheck) {
    closingChecklist.value = {};
    return;
  }

  try {
    const savedChecklist = JSON.parse(state.value.matterClosedCheck);
    // Replace the entire object instead of modifying it
    closingChecklist.value = { ...savedChecklist };
  } catch (e) {
    closingChecklist.value = {};
  }
}

// Single function to toggle checklist item and save changes
function toggleChecklistItem(id: string, e: Event) {
  if (isUpdatingChecklist.value) return; // Skip if we're already updating

  isUpdatingChecklist.value = true;

  try {
    const checked = (e.target as HTMLInputElement)?.checked || false;

    // Create a new object to ensure reactivity
    const updatedChecklist = { ...closingChecklist.value, [id]: checked };
    closingChecklist.value = updatedChecklist;

    const checklistData = JSON.stringify(updatedChecklist);

    // Simply update the state and let usePatchable handle the PATCH
    state.value.matterClosedCheck = checklistData;
    isUpdatingChecklist.value = false;
  } catch (error) {
    console.error("Error in toggleChecklistItem:", error);
    isUpdatingChecklist.value = false;
  }
}

const { state } = usePatchable<MatterDto>({
  identifier: props.id,
  getter: MatterStore.getters.GET_MATTER,
  query: MatterStore.actions.GET_MATTER,
  queryParams: () => ({ id: props.id }),
  patchQuery: MatterStore.actions.PATCH_MATTER,
  patchQueryParams: () => ({ id: props.id })
});

const estimatedBudget = ref<number | null>(null);
const expectedWorkDeliveryDate = ref<string | null>(null);

watch(
  () => state.value,
  (newMatter) => {
    if (newMatter?.estimatedBudget) {
      estimatedBudget.value = newMatter.estimatedBudget;
    }
    if (newMatter?.estimatedClosingDate) {
      expectedWorkDeliveryDate.value = newMatter.estimatedClosingDate;
    }

    // Checklist loading is now handled only in onMounted
  },
  { immediate: true }
);

onMounted(() => {
  store.dispatch(MatterStore.actions.GET_MATTER, { id: props.id }).then(() => {
    // Load checklist data only after the matter is loaded
    loadClosingChecklist();
  });

  store.dispatch(TrustStore.actions.GET_MATTER_TRUST_SUMMARY, {
    id: props.id
  });
  store.dispatch(MatterStore.actions.GET_MATTER_OVERVIEW, { id: props.id });
});

const currentStatus = computed(() => state.value?.status);

const { fireConfirm, fireErrorToast } = useNotify();

const trustBalance = computed<MatterTrustSummaryDto | null | undefined>(() =>
  ApiStore.toData<MatterTrustSummaryDto>(
    store.getters[TrustStore.getters.GET_MATTER_TRUST_SUMMARY]
  )
);

const matterOverview = computed(() =>
  ApiStore.toData<MatterOverviewDto>(
    store.getters[MatterStore.getters.GET_MATTER_OVERVIEW](props.id)
  )
);

// Computed property to check if matter can be closed
const canCloseMatter = computed(() => {
  if (!trustBalance.value || !matterOverview.value) return false;

  // Trust account should be clear (balance zero)
  const trustAccountClear =
    !trustBalance.value.trustAccountTotalBalance ||
    trustBalance.value.trustAccountTotalBalance === 0;

  // WIP should be fully billed
  const wipClear =
    !matterOverview.value.totalUnBilledTimeValue ||
    matterOverview.value.totalUnBilledTimeValue === 0;

  // All invoices should be sent
  const invoicesClear =
    !(
      matterOverview.value.totalInvoiceValueInDraft ||
      matterOverview.value.totalInvoiceValueInAwaitingApproval ||
      matterOverview.value.totalInvoiceValueInApproved
    ) ||
    (matterOverview.value.totalInvoiceValueInDraft || 0) +
      (matterOverview.value.totalInvoiceValueInAwaitingApproval || 0) +
      (matterOverview.value.totalInvoiceValueInApproved || 0) ===
      0;

  return trustAccountClear && wipClear && invoicesClear;
});

// Define the statuses in the flow order
const statusSteps = [
  { value: MatterStatus.ToBeQuoted, label: "To Be Quoted" },
  { value: MatterStatus.QuotedAwaitingAcceptance, label: "Quoted" },
  { value: MatterStatus.Open, label: "Open" },
  { value: MatterStatus.Closed, label: "Closed" }
];

// Lost status is handled separately since it's not part of the normal flow
const lostStatus = { value: MatterStatus.Lost, label: "Lost" };
const finalisedStatus = { value: MatterStatus.Finalised, label: "Finalised" };

// Computed property to get current status index
const currentStatusIndex = computed(() => {
  return statusSteps.findIndex((step) => step.value === currentStatus.value);
});

// Function to determine if a status can be transitioned to
function canTransitionTo(status: MatterStatus): boolean {
  if (!currentStatus.value) return false;

  // Special case for Lost status
  if (currentStatus.value === MatterStatus.Lost) {
    // From Lost, can only go back to ToBeQuoted
    return status === MatterStatus.ToBeQuoted;
  }

  // Don't show Finalised in stepper flow
  if (status === MatterStatus.Finalised) {
    return false;
  }

  switch (currentStatus.value) {
    case MatterStatus.ToBeQuoted:
      return (
        status === MatterStatus.QuotedAwaitingAcceptance ||
        status === MatterStatus.Lost
      );
    case MatterStatus.QuotedAwaitingAcceptance:
      return status === MatterStatus.Open || status === MatterStatus.Lost;
    case MatterStatus.Open:
      return status === MatterStatus.Closed;
    case MatterStatus.Closed:
      return status === MatterStatus.Open; // Allow transition back to Open
    case MatterStatus.Finalised:
      return false; // Cannot transition from Finalised
    default:
      return false;
  }
}

// Get description for each status
function getStatusDescription(status: MatterStatus | undefined): string {
  if (!status) return "";

  switch (status) {
    case MatterStatus.ToBeQuoted:
      return "Matter is in initial state awaiting a quote to be prepared.";
    case MatterStatus.QuotedAwaitingAcceptance:
      return "Quote has been provided to the client and is awaiting acceptance.";
    case MatterStatus.Open:
      return "Client has accepted the quote and work is in progress.";
    case MatterStatus.Closed:
      return "Matter work has been completed.";
    case MatterStatus.Finalised:
      return "Matter has been completely finalized and archived.";
    case MatterStatus.Lost:
      return "Client has declined the quote or matter has been cancelled.";
    default:
      return "";
  }
}

function confirmMarkAsQuoted() {
  emit("close");
  store
    .dispatch(MatterStore.actions.MARK_AS_QUOTED, { id: props.id })
    .then(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
}

function confirmMarkAsLost() {
  showLostPopover.value = false;
  emit("close");
  store
    .dispatch(MatterStore.actions.MARK_AS_LOST, {
      id: props.id,
      matterLostReason: matterLostReason.value
    })
    .then(() => emit("close"));
}

function confirmReopenMatter() {
  showReopenPopover.value = false;
  emit("close");
  store
    .dispatch(MatterStore.actions.REOPEN_MATTER, { id: props.id })
    .then(() => emit("close"));
}

function confirmReopenClosedMatter() {
  showReopenClosedPopover.value = false;
  emit("close");
  store
    .dispatch(MatterStore.actions.REOPEN_CLOSED_MATTER, { id: props.id })
    .then(() => emit("close"));
}

function confirmMarkAsOpen() {
  showConfirmOpenPopover.value = false;
  emit("close");
  store
    .dispatch(MatterStore.actions.MARK_AS_OPEN, { id: props.id })
    .then(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
}

function confirmMarkAsClosed() {
  showClosedPopover.value = false;
  emit("close");
  var curBalance: MatterTrustSummaryDto | any = trustBalance.value;
  if (curBalance.trustAccountTotalFunds <= 0) {
    store
      .dispatch(MatterStore.actions.MARK_AS_CLOSED, { id: props.id })
      .then(() => emit("close"));
  } else {
    fireErrorToast(
      "You have funds in account, please clear before closing the matter!"
    );
  }
}

// Function to select matter lost reason from badges
const selectMatterLostReason = (reason: string) => {
  matterLostReason.value = reason;
};

function sendReferrerThankYouEmail() {
  // Dispatch action to load and open referrer thank you email template
  store.dispatch(
    SendEmailStore.actions.LOAD_REFERRER_THANK_YOU_TEMPLATE,
    { matterId: props.id },
    { root: true }
  );
}

function sendMatterCloseEmail() {
  // Dispatch action to load and open matter close email template
  store.dispatch(
    SendEmailStore.actions.LOAD_MATTER_CLOSE_EMAIL_TEMPLATE,
    { matterId: props.id },
    { root: true }
  );
}

function openSharePointFolder() {
  // Implement SharePoint folder opening based on matter status
  const baseUrl =
    "https://zumesoft.sharepoint.com/sites/AndreyevServer/Shared Documents";
  let clientFolder = "";
  let clientSubFolder = state.value?.sharePointFolder;

  if (!clientSubFolder) {
    fireErrorToast("SharePoint folder not found for this matter");
    return;
  }

  switch (state.value?.status) {
    case MatterStatus.ToBeQuoted:
      clientFolder = "/S Sales/Current Leads & Quotes/";
      break;
    case MatterStatus.QuotedAwaitingAcceptance:
      clientFolder = "/S Sales/Current Leads & Quotes/";
      break;
    case MatterStatus.Lost:
      clientFolder = "/S Sales/Lost Leads/";
      break;
    case MatterStatus.Open:
      clientFolder = "/VD Matters_Current/";
      break;
    case MatterStatus.Closed:
      if (clientSubFolder.charAt(0).match(/[a-zA-Z]/)) {
        clientFolder =
          "/VD Matters_Closed/Clients_Dormant " +
          clientSubFolder.charAt(0).toUpperCase() +
          "/";
      } else {
        clientFolder = "/VD Matters_Closed/Clients_Dormant %23/";
      }
      break;
    case MatterStatus.Finalised:
      clientFolder = "/VD Matters_Closed/";
      break;
    default:
      clientFolder = "/";
  }

  window.open(baseUrl + clientFolder + clientSubFolder, "_blank");
}

function navigateToNotes() {
  // Close the current modal
  emit("close");

  // Navigate to the matter's notes section using router
  router.push(`/matters/${props.id}/notes`);
}
</script>

<style scoped>
@keyframes flowRight {
  0% {
    width: 0;
    left: 0;
  }
  100% {
    width: 100%;
    left: 0;
  }
}

.flow-right-animation {
  animation: flowRight 2s ease-in-out infinite;
}
</style>
