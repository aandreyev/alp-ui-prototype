<style>
.pointer {
  cursor: pointer;
}
</style>

<template>
  <div class="block bg-white rounded-md p-3 md:p-6">
    <div class="flex flex-col mb-3">
      <div
        class="flex justify-between text-xs md:text-base font-medium gap-2 flex-wrap mb-2 sm:m-0"
      >
        <router-link
          :to="{
            name: 'Invoice',
            params: { id: invoice.id }
          }"
          target="_blank"
          class="flex flex-wrap gap-1 items-center"
        >
          <alp-default-badge
            :text="invoice?.invoiceNumber"
            :color="'yellow'"
            v-if="
              invoice.status == 1 || invoice.status == 2 || invoice.status == 3
            "
          >
          </alp-default-badge>
          <alp-default-badge
            :text="invoice?.invoiceNumber"
            :color="'blue'"
            v-else
          >
          </alp-default-badge>
          <!-- <span class="text-white font-semibold text-sm rounded-full px-2 mr-1" :class="
            invoice.status == 1 || invoice.status == 2 || invoice.status == 3
              ? 'bg-yellow-600'
              : 'bg-blue-900'
          ">
            # {{ invoice?.invoiceNumber }}
          </span> -->

          <!-- <span class="text-white font-semibold text-sm rounded-full px-2 mr-1"
            :class="invoice.type == 1 ? 'bg-yellow-900' : 'bg-green-900'">
            {{ invoice?.type == 1 ? "Fixed Price" : "Time Entry" }}
          </span> -->

          <alp-default-badge
            :text="'Fixed Price'"
            :color="'indigo'"
            v-if="invoice?.type == 1"
          >
          </alp-default-badge>
          <alp-default-badge :text="'Time Entry'" :color="'green'" v-else>
          </alp-default-badge>

          <!-- <span v-if="invoice.status == 4" class="text-white font-semibold text-sm rounded-full px-2 mr-1"
            :class="invoice.isInvoicePaid ? 'bg-green-600' : 'bg-red-600'">
            {{ invoice.isInvoicePaid ? "Paid" : "Unpaid" }}
          </span> -->

          <alp-default-badge
            :text="'Paid'"
            :color="'green'"
            v-if="invoice.status == 4 && invoice.isInvoicePaid"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Unpaid'"
            :color="'red'"
            v-if="invoice.status == 4 && !invoice.isInvoicePaid"
          >
          </alp-default-badge>

          <span class="hover:text-blue-500 pl-2 inline-block"
            >{{ invoice?.matter?.name }} - [{{ invoice?.matter?.id }}]
          </span>
        </router-link>
        <span class="flex space-x-2 md:w-auto w-full">
          <!-- <span class=" text-white justify-center font-semibold text-xs rounded-md px-2 py-4 inline-flex bg-blue-400">Reviewer: {{invoice.matter?.reviewer?.fullName}} </span>
          <span class=" text-white justify-center font-semibold text-xs rounded-md px-2 py-4 inline-flex bg-blue-400">Coordinater</span> -->

          <!-- Dropdown List -->
          <Menu as="div" class="relative inline-block text-left">
            <div>
              <MenuButton
                class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
              >
                Actions
                <font-awesome-icon
                  icon="fa-solid fa-chevron-down"
                  aria-hidden="true"
                  class="ml-3"
                />
                <!-- <ChevronDownIcon
                  class="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                /> -->
              </MenuButton>
            </div>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="origin-top-right absolute z-10 md:right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
              >
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="
                        downloadInvoicePdf(invoice?.id, invoice?.invoiceNumber)
                      "
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Download Invoice</a
                    >
                  </MenuItem>
                </div>
                <div v-if="invoice.daysOverDue > 0" class="py-1">
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="
                        downloadInvoiceStatement(
                          invoice?.matter?.client.id,
                          invoice?.invoiceNumber
                        )
                      "
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-xs md:text-sm'
                      ]"
                      >Download Invoice Statement</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="sendInvoiceStatement(invoice?.matter?.client.id)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 md:text-sm text-xs'
                      ]"
                      >Send Invoice Statement</a
                    >
                  </MenuItem>
                </div>

                <div
                  v-if="
                    invoice.daysOverDue > 0 &&
                    (invoice.doNotCollect == false ||
                      invoice.doNotCollect == null)
                  "
                  class="py-1"
                >
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="
                        getFriendlyReminder(invoice?.id, invoice?.invoiceNumber)
                      "
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Download Friendly Reminder</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="sendFriendlyReminder(invoice?.id)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Send Friendly Reminder</a
                    >
                  </MenuItem>
                </div>

                <div
                  v-if="
                    invoice.daysOverDue > 14 &&
                    (invoice.doNotCollect == false ||
                      invoice.doNotCollect == null)
                  "
                  class="py-1"
                >
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="
                        getFirstReminder(invoice?.id, invoice?.invoiceNumber)
                      "
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Download First Reminder</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="sendFirstReminder(invoice?.id)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Send First Reminder</a
                    >
                  </MenuItem>
                </div>
                <div
                  v-if="
                    invoice.daysOverDue > 28 &&
                    (invoice.doNotCollect == false ||
                      invoice.doNotCollect == null)
                  "
                  class="py-1"
                >
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="
                        getSecondReminder(invoice?.id, invoice?.invoiceNumber)
                      "
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Download Second Reminder</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="sendSecondReminder(invoice?.id)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Send Second Reminder</a
                    >
                  </MenuItem>
                </div>
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="deleteInvoice(invoice.id)"
                      :class="[
                        active ? 'bg-gray-100 text-red-700' : 'text-red-600',
                        'block px-4 py-2 text-sm'
                      ]"
                      >Delete</a
                    >
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </span>
      </div>

      <div class="flex text-sm flex-wrap">
        {{ invoice?.matter?.client?.clientName }} &nbsp;
        <i>
          ({{
            invoice?.matter?.client?.primaryContact?.invoiceEmail != "" &&
            invoice?.matter?.client?.primaryContact?.invoiceEmail != null
              ? invoice?.matter?.client?.primaryContact?.invoiceEmail
              : invoice?.matter?.client?.primaryContact?.email
          }})
        </i>
      </div>

      <div class="flex text-sm flex-wrap">
        <span>
          <b class="text-gray-600">Reviewer:</b>
          {{ invoice.matter?.reviewer?.fullName }}
        </span>
        &nbsp; | &nbsp;
        <span>
          <b class="text-gray-600">Coordinator:</b>
          {{ invoice.matter?.coordinator?.fullName }}
        </span>
      </div>

      <div
        class="flex text-xs font-semibold mt-2 mb-2 space-x-2 items-baseline"
      >
        <div v-if="invoice.note">
          <div class="flex mb-2">
            <router-link
              :to="{
                name: 'Matter Notes',
                params: { id: invoice?.matter?.id }
              }"
              target="_blank"
              class="hover:text-blue-500"
            >
              <span class="flex font-bold">
                Last Note
                <font-awesome-icon
                  icon="fa-solid fa-arrow-up-right-from-square"
                  aria-hidden="true"
                  class="mr-1 ml-1 mb-2 h-4 w-4 text-gray-600"
                />
                <!-- <ExternalLinkIcon class="-mr-1 ml-1 mb-2 h-4 w-4 text-gray-600" aria-hidden="true" /> -->
              </span>
            </router-link>

            &nbsp; from &nbsp;
            <span className="font-bold">
              {{ invoice?.note?.insertedBy.fullName }}
            </span>
            &nbsp; at &nbsp;

            <span className="font-bold">{{
              new Date(invoice?.note?.insertedAt).toLocaleDateString("en-AU")
            }}</span>
            &nbsp;
          </div>

          <div class="flex text-xs mb-1">
            <span
              className="min-w-0 text-sm border-l-4 border-indigo-600 pl-4 pt-2 pb-2"
              v-html="invoice?.note?.message"
            />
          </div>
        </div>
      </div>

      <div
        class="flex mt-1 justify-between gap-2 md:gap-0 sm:space-x-5 flex-wrap"
      >
        <div
          class="sm:w-auto w-full sm:flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
        >
          <span class="text-sm md:text-xl font-sans font-bold">{{
            fmtToLocalShortDate(invoice?.invoiceDate)
          }}</span>
          <span class="text-gray-500">Invoice Date</span>
        </div>
        <div
          class="sm:w-auto w-full sm:flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          :class="invoice?.daysOverDue > 0 ? 'text-red-600' : 'text-green-600'"
        >
          <span class="text-sm md:text-xl font-sans font-bold">{{
            fmtToLocalShortDate(invoice?.dueDate)
          }}</span>
          <span v-if="invoice?.doNotCollect" class="flex mb-2">
            <font-awesome-icon
              icon="fa-solid fa-triangle-exclamation"
              class="flex mr-2 h-5 w-5 text-yellow-500"
            />
            Do Not Collect
          </span>
          <span v-if="invoice?.daysOverDue <= 0">Due Date </span>
          <span v-if="invoice?.daysOverDue > 0">
            {{ invoice?.daysOverDue }} Days Over Due</span
          >
        </div>
        <div
          class="sm:w-auto w-full sm:flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          v-if="invoice.status == 4"
        >
          <span class="text-xl font-sans font-bold">{{
            fmtCurrency(invoice?.totalInvoiceAmountInclGst)
          }}</span>
          <span class="text-gray-500">Invoice Amount Inc.GST</span>
        </div>
        <div
          class="sm:w-auto w-full sm:flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          v-if="invoice.status == 4"
        >
          <span class="text-xl font-sans font-bold">{{
            fmtCurrency(invoice?.receivedPayments)
          }}</span>
          <span class="text-gray-500">Paid Amount Inc.GST</span>
        </div>
        <div
          class="sm:w-auto w-full sm:flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          v-if="invoice.status == 4"
        >
          <span class="text-xl font-sans font-bold">{{
            fmtCurrency(invoice?.outstandingAmount)
          }}</span>
          <span class="text-gray-500">Outstanding Inc.GST</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { useEnum } from "@/composable/enum";

import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { fmtToLocalDatetime, fmtToLocalShortDate } from "@/composable/date";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { DownloadStore } from "@/store/modules/downloads";
import { useNotify } from "@/composable/notify";
import { InvoiceStore } from "@/store/modules/invoices";
import { format } from "date-fns";
import { MatterStatus, MatterStatusTypes } from "@/network/dtos/enumTypes";
import { InvoiceListDto } from "@/network/dtos/invoice-dto";
import { InvoiceServiceProxy } from "@/network/invoice-service-proxies";
export default defineComponent({
  props: {
    invoice: {
      type: Object as PropType<InvoiceListDto>,
      required: true
    }
  },
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
    // ExternalLinkIcon,
    // ExclamationIcon
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fireConfirm, fireSuccessToast, fireErrorToast } = useNotify();

    const matterOutcomeState = reactive({
      showCompleted: false
    });

    // Download Invoice PDF

    function downloadInvoicePdf(invoiceId: number, invoiceNumber: number) {
      fireSuccessToast(
        "Invoice pdf has been scheduled, check back in a download centre"
      );

      new InvoiceServiceProxy()
        .getInvoicePdfLink(Number(invoiceId))
        .then((result) => {
          store.dispatch(DownloadStore.actions.ADD_DOWNLOAD, {
            name: `Invoice #: ${invoiceNumber}_${format(
              new Date(),
              "yyyy-MM-dd_HH-mm-ss"
            )}`,
            submissionId: result.result
          });
        });
    }

    function getFriendlyReminder(invoiceId: number, invoiceNumber: number) {
      fireSuccessToast(
        "Friendly Reminder has been scheduled, check back in a download centre"
      );
      new InvoiceServiceProxy()
        .getFriendlyReminderPdfLink(invoiceId)
        .then((result) => {
          store.dispatch(DownloadStore.actions.ADD_DOWNLOAD, {
            name: `Friendly Reminder for Invoice : # ${invoiceNumber}`,
            submissionId: result.result
          });
        });
    }
    function sendFriendlyReminder(invoiceId: number) {
      fireConfirm(
        "Are you sure to send a Friendly Reminder to this Client?"
      ).then((result) => {
        if (result.isConfirmed) {
          new InvoiceServiceProxy()
            .sendFriendlyReminderEmail(invoiceId)
            .then(() => {
              fireSuccessToast(
                "Friendly Reminder has been scheduled at beckend Successfully !"
              );
              emit("close");
            });
        }
      });
    }
    function getFirstReminder(invoiceId: number, invoiceNumber: number) {
      fireSuccessToast(
        "First Reminder has been scheduled, check back in a download centre"
      );
      new InvoiceServiceProxy()
        .getFirstReminderPdfLink(invoiceId)
        .then((result) => {
          store.dispatch(DownloadStore.actions.ADD_DOWNLOAD, {
            name: `First Reminder for Invoice : # ${invoiceNumber}`,
            submissionId: result.result
          });
        });
    }
    function sendFirstReminder(invoiceId: number) {
      fireConfirm("Are you sure to send a First Reminder to this Client?").then(
        (result) => {
          if (result.isConfirmed) {
            new InvoiceServiceProxy()
              .sendFirstReminderEmail(invoiceId)
              .then(() => {
                fireSuccessToast(
                  "First Reminder has been scheduled at beckend Successfully !"
                );
                emit("close");
              });
          }
        }
      );
    }
    function getSecondReminder(invoiceId: number, invoiceNumber: number) {
      fireSuccessToast(
        "Second Reminder has been scheduled, check back in a download centre"
      );
      new InvoiceServiceProxy()
        .getSecondReminderPdfLink(invoiceId)
        .then((result) => {
          store.dispatch(DownloadStore.actions.ADD_DOWNLOAD, {
            name: `Second Reminder for Invoice : # ${invoiceNumber}`,
            submissionId: result.result
          });
        });
    }
    function sendSecondReminder(invoiceId: number) {
      fireConfirm(
        "Are you sure to send a Second Reminder to this Client?"
      ).then((result) => {
        if (result.isConfirmed) {
          new InvoiceServiceProxy()
            .sendSecondReminderEmail(invoiceId)
            .then(() => {
              fireSuccessToast(
                "Second Reminder has been scheduled at beckend Successfully !"
              );
              emit("close");
            });
        }
      });
    }

    async function getTotalTimeValue(invoiceId: number) {
      var res = new InvoiceServiceProxy().getInvoiceTimeEntries(invoiceId);
      return (await res).count;
    }

    async function getTotalFixedPrice(invoiceId: number) {
      var res = new InvoiceServiceProxy().getInvoiceFixedPriceItems(invoiceId);
      return (await res).count;
    }

    async function getTotalDisbursement(invoiceId: number) {
      var res = new InvoiceServiceProxy().getInvoiceDisbursements(invoiceId);
      return (await res).count;
    }

    // checking condition: totaltimevalue
    async function deleteInvoice(invoiceId: number) {
      var totalTimeVal = await getTotalTimeValue(Number(invoiceId));
      var totalFixedPrice = await getTotalFixedPrice(Number(invoiceId));
      var totalDisbursement = await getTotalDisbursement(Number(invoiceId));

      if (totalTimeVal == 0 && totalFixedPrice == 0 && totalDisbursement == 0) {
        // legit deletion
        store.dispatch(InvoiceStore.actions.REMOVE_INVOICES, {
          id: invoiceId
        });
      } else {
        // illegit response
        fireErrorToast(
          "Invoice could not be deleted, please make sure time entries, fixed price items and disbursements are all empty!"
        );
      }
    }

    //Invoice Statement

    function downloadInvoiceStatement(clientId: number) {
      fireSuccessToast(
        "Invoice Statement has been scheduled, check back in a download centre"
      );

      new InvoiceServiceProxy()
        .getInvoiceStatementPdfLink(clientId)
        .then((result) => {
          store.dispatch(DownloadStore.actions.ADD_DOWNLOAD, {
            name: `Invoice Statement for Client : # ${clientId}`,
            submissionId: result.result
          });
        });
    }

    function sendInvoiceStatement(clientId: number) {
      fireConfirm(
        "Are you sure to send a Invoice Statement to this Client?"
      ).then((result) => {
        if (result.isConfirmed) {
          new InvoiceServiceProxy()
            .sendInvoiceStatementEmail(clientId)
            .then(() => {
              fireSuccessToast(
                "Invoice Statement has been scheduled at beckend Successfully !"
              );
              emit("close");
            });
        }
      });
    }

    const { toDescription: toStatusDescription } = useEnum(MatterStatus);

    return {
      matterOutcomeState,
      toStatusDescription,
      fmtCurrency,
      MatterStatusTypes,
      fmtToLocalShortDate,
      fmtToLocalDatetime,
      downloadInvoicePdf,
      getFriendlyReminder,
      sendFriendlyReminder,
      getFirstReminder,
      sendFirstReminder,
      getSecondReminder,
      sendSecondReminder,
      deleteInvoice,
      downloadInvoiceStatement,
      sendInvoiceStatement
    };
  }
});
</script>
