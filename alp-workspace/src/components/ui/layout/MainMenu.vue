<template>
  <alp-menu-container :isRemoveWide="true">
    <nav-link
      :hidden="hideMenu"
      to="/user/dashboard"
      icon="fa-solid fa-chart-simple fa-xl"
      @navigated="$emit('navigated')"
    >
    </nav-link>
    <!--  Emails Menu -->
    <nav-link
      :hidden="hideMenu"
      name="Emails"
      to="#"
      icon="fa-solid fa-envelope fa-xl"
    >
      <template v-slot:accordion>
        <nav-link
          :hidden="hideMenu"
          name="Inbox"
          to="/user/emails/inbox"
          :customClass="'ml-8'"
          @navigated="$emit('navigated')"
        >
        </nav-link>
        <nav-link
          :hidden="hideMenu"
          name="Sent"
          to="/user/emails/sent"
          :customClass="'ml-8'"
          @navigated="$emit('navigated')"
        >
        </nav-link>
      </template>
    </nav-link>
    <nav-link
      :hidden="hideMenu"
      v-if="can('Calendar.View')"
      icon="fa-solid fa-calendar fa-xl"
      to="/user/calendar"
      @navigated="$emit('navigated')"
    />

    <!--  CRM Menu -->
    <alp-can-any
      :permissions="['Contact.View', 'Organisation.View', 'Client.View']"
    >
      <nav-link
        :hidden="hideMenu"
        name="CRM"
        to="#"
        icon="fa-solid fa-address-book fa-xl"
        :isExpanded="true"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Contact.View')"
            to="/user/contacts"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          >
            <div v-if="can('Contact.Create')" class="flex items-center ml-auto">
              <!-- <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button" @click.stop="showModal(ModalType.CreateContact)">
                <font-awesome-icon class="text-gray-600 cursor-pointer" icon="fa-solid fa-plus" />
              </span> -->

              <CreateContact :addbutton="true" />
            </div>
          </nav-link>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Organisation.View')"
            to="/user/organisations"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          >
            <div
              v-if="can('Organisation.Create')"
              class="flex items-center ml-auto"
            >
              <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button"
                @click.stop="showModal(ModalType.CreateOrganisation)"
              >
                <font-awesome-icon
                  class="text-gray-600 cursor-pointer"
                  icon="fa-solid fa-plus"
                />
              </span>
            </div>
          </nav-link>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Client.View')"
            to="/user/clients"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          >
            <div v-if="can('Client.Create')" class="flex items-center ml-auto">
              <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button"
                @click.stop="showModal(ModalType.CreateClient)"
              >
                <font-awesome-icon
                  class="text-gray-600 cursor-pointer"
                  icon="fa-solid fa-plus"
                />
              </span>
            </div>
          </nav-link>
        </template>
      </nav-link>
    </alp-can-any>

    <!--  Matters Menu -->
    <alp-can-any :permissions="['Matter.View']">
      <nav-link
        :hidden="hideMenu"
        to="#"
        icon="fa-solid fa-gavel fa-xl"
        name="Matters"
      >
        <template v-slot:accordion>
          <!-- Show all Matters -->
          <nav-link
            :hidden="hideMenu"
            v-if="can('Matter.View')"
            to="/user/matters"
            name="Matters"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          >
            <div v-if="can('Client.Create')" class="flex items-center ml-auto">
              <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button"
                @click.stop="showModal(ModalType.CreateMatter)"
              >
                <font-awesome-icon
                  class="text-gray-600 cursor-pointer"
                  icon="fa-solid fa-plus"
                />
              </span>
            </div>
          </nav-link>

          <!-- Show all Matters Report-->
          <nav-link
            :hidden="hideMenu"
            v-if="can('Matter.View')"
            :to="{ name: 'Matters Report' }"
            name="Matters Report"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          ></nav-link>

          <nav-link
            :hidden="hideMenu"
            v-if="can('Matter.View')"
            to="/user/offerings"
            name="Offerings"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          />

          <nav-link
            :hidden="hideMenu"
            :to="{ name: 'Syntaq Records' }"
            name="Syntaq Records"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          ></nav-link>

          <nav-link
            :hidden="hideMenu"
            :to="{ name: 'Syntaq Forms' }"
            name="Syntaq Forms"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          ></nav-link>
        </template>
      </nav-link>
    </alp-can-any>

    <!--Time Tracking Menu-->

    <alp-can-any :permissions="['Matter.View', 'Project.View']">
      <nav-link
        :hidden="hideMenu"
        to="#"
        icon="fa-solid fa-clock fa-xl"
        name="Time Tracking"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            :to="{ name: 'Time Entries' }"
            name="Time Entries"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          >
            <div class="flex items-center ml-auto">
              <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button"
                @click.stop="showModal(ModalType.CreateTimeEntry)"
              >
                <font-awesome-icon
                  class="text-gray-600 cursor-pointer"
                  icon="fa-solid fa-plus"
                />
              </span>
            </div>
          </nav-link>
        </template>
      </nav-link>
    </alp-can-any>
    <!--Register Menu-->
    <alp-can-any :permissions="['MailRegister.View']">
      <nav-link
        :hidden="hideMenu"
        name="Register"
        to="#"
        icon="fa-solid fa-keyboard fa-xl"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            to="/user/incoming-mails"
            name="Mail Register"
            :customClass="'ml-8'"
            @navigated="$emit('navigated')"
          ></nav-link>
          <alp-can-any :permissions="['Risk.View']">
            <nav-link
              :hidden="hideMenu"
              to="/user/risk-registers"
              name="Risk Register"
              :customClass="'ml-8'"
              @navigated="$emit('navigated')"
            ></nav-link>
          </alp-can-any>
          <alp-can-any :permissions="['IncidentLog.View']">
            <nav-link
              :hidden="hideMenu"
              to="/user/incident-logs"
              name="Incident Log"
              :customClass="'ml-8'"
              @navigated="$emit('navigated')"
            ></nav-link>
          </alp-can-any>
          <alp-can-any :permissions="['CommonType.View']">
            <nav-link
              :hidden="hideMenu"
              to="/user/ppsr-registers"
              name="PPSR Register"
              :customClass="'ml-8'"
              @navigated="$emit('navigated')"
            ></nav-link>
          </alp-can-any>
        </template>
      </nav-link>
    </alp-can-any>

    <!--Projects Menu-->
    <alp-can-any :permissions="['Project.View']">
      <nav-link
        :hidden="hideMenu"
        to="#"
        icon="fa-solid fa-list-ul fa-xl"
        name="Projects"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Project.View')"
            to="/user/sprints"
            :customClass="'ml-8'"
            name="Sprints"
            @navigated="$emit('navigated')"
          />
          <nav-link
            :hidden="hideMenu"
            v-if="can('Project.View')"
            to="/user/projects"
            :customClass="'ml-8'"
            name="Projects"
            @navigated="$emit('navigated')"
          >
            <div v-if="can('Project.Create')" class="flex items-center ml-auto">
              <span
                class="transition duration-500 relative flex-none flex items-center justify-center p-1 rounded-full cursor-pointer hover:bg-gray-400"
                role="button"
                @click.stop="showModal(ModalType.CreateProject)"
              >
                <font-awesome-icon
                  class="text-gray-600 cursor-pointer"
                  icon="fa-solid fa-plus"
                />
              </span>
            </div>
          </nav-link>

          <nav-link
            :hidden="hideMenu"
            v-if="can('Project.View')"
            to="/user/project-routines"
            :customClass="'ml-8'"
            name="Routines"
            @navigated="$emit('navigated')"
          />
          <nav-link
            :hidden="hideMenu"
            v-if="can('Project.View')"
            to="/user/project-tasks-list"
            :customClass="'ml-8'"
            name="Project Tasks"
            @navigated="$emit('navigated')"
          />
          <nav-link
            :hidden="hideMenu"
            v-if="can('Project.View')"
            to="/user/todo"
            :customClass="'ml-8'"
            name="Todo"
            @navigated="$emit('navigated')"
          />
        </template>
      </nav-link>
    </alp-can-any>

    <!--Statistics Menu-->

    <alp-can-any :permissions="['Metabase.View']">
      <nav-link
        :hidden="hideMenu"
        to="#"
        name="Statistics"
        icon="fa-solid fa-server fa-xl"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Metabase.View')"
            to="/user/metabase-dashboard"
            :customClass="'ml-8'"
            name="Metabase Dashboard"
            @navigated="$emit('navigated')"
          />
          <nav-link
            :hidden="hideMenu"
            v-if="can('Metabase.View')"
            to="/user/metabase"
            :customClass="'ml-8'"
            name="Metabase Reports"
            @navigated="$emit('navigated')"
          />
        </template>
      </nav-link>
    </alp-can-any>

    <!--Invoices Menu-->
    <alp-can-any :permissions="['Invoice.View']">
      <nav-link
        :hidden="hideMenu"
        to="#"
        icon="fa-solid fa-file-invoice-dollar fa-xl"
        name="Invoices"
      >
        <template v-slot:accordion>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Invoice.View')"
            :to="{ name: 'Invoices' }"
            :customClass="'ml-8'"
            name="Invoices"
            @navigated="$emit('navigated')"
          >
            <div v-if="can('Invoice.Draft')" class="flex items-center ml-auto">
              <CreateInvoice :addbutton="true" />
            </div>
          </nav-link>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Invoice.Approve')"
            :to="{ name: 'Invoice Approvals' }"
            :customClass="'ml-8'"
            name="Approvals"
            @navigated="$emit('navigated')"
          >
            <div class="flex items-center ml-auto">
              <span
                v-if="currentUser?.invoicesAwaitingApproval"
                class="h-6 w-6 bg-blue-300 text-blue-600 flex-none flex items-center justify-center p-1 rounded-xl cursor-pointer"
                >{{ currentUser?.invoicesAwaitingApproval }}</span
              >
            </div>
          </nav-link>
          <nav-link
            :hidden="hideMenu"
            v-if="can('Invoice.Send')"
            :to="{ name: 'Invoices Ready' }"
            :customClass="'ml-8'"
            name="Ready to Send"
            @navigated="$emit('navigated')"
          >
            <div class="flex items-center ml-auto">
              <span
                v-if="currentUser?.invoicesReadyForProcessing"
                class="h-6 w-6 bg-green-300 text-green-600 flex-none flex items-center justify-center p-1 rounded-xl cursor-pointer"
                >{{ currentUser?.invoicesReadyForProcessing }}</span
              >
            </div>
          </nav-link>
        </template>
      </nav-link>
    </alp-can-any>

    <!-- Team Resources Menu -->
    <nav-link
      :hidden="hideMenu"
      name="Team Resources"
      to="#"
      icon="fa-brands fa-wikipedia-w fa-xl"
    >
      <template v-slot:accordion>
        <div>
          <div class="nav-link-container flex items-center px-3 py-0 text-xs">
            <span
              class="nav-link transition duration-500 flex-1 flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 pl-11"
            >
              <a
                class="nav-link-item flex-1"
                href="https://wiki.adlvlaw.com.au/"
                target="_target"
                @click="$emit('navigated')"
                >Wiki Page</a
              >
            </span>
          </div>
        </div>
      </template>
    </nav-link>

    <nav-link
      :hidden="hideMenu"
      icon="fa-solid fa-circle-info fa-xl"
      :to="{ name: 'Support Tickets' }"
      @navigated="$emit('navigated')"
    />
  </alp-menu-container>
</template>

<script lang="ts">
import AlpIcon from "@/components/common/AlpIcon.vue";
import NavLink from "@/components/common/NavLink.vue";
import { useCan } from "@/composable/can";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { UserStore } from "@/store/modules/users";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import CreateInvoice from "@/components/ui/invoices/CreateInvoice.vue";
import CreateContact from "@/components/ui/contacts/CreateContact.vue";

export default defineComponent({
  emits: ["navigated"],
  props: {
    hideMenu: {
      type: Boolean,
      default: false
    }
  },
  components: {
    NavLink,
    //NavSeparator,
    AlpIcon,
    CreateInvoice,
    CreateContact
  },
  setup() {
    const { can } = useCan();
    const store = useStore();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);

    function showModal(type: ModalType) {
      store.dispatch(ModalStore.actions.SHOW_MODAL, {
        modal: type
      });
    }

    return {
      can,
      currentUser,
      showModal,
      ModalType
    };
  }
});
</script>
