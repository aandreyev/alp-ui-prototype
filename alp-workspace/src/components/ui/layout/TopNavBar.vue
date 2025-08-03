<template>
  <div class="flex items-center ml-auto">
    <div class="border-gray-300 flex text-gray-500">
      <div class="flex flex-col px-1 items-center md:border-l-2">
        <div class="w-5">
          <font-awesome-icon icon="fa fa-gavel fa-lg" />
        </div>
        <div class="text-xs font-medium">
          {{ state.TotalSalesTimeEntry + state.TotalMatterTimeEntry }}
          Units
        </div>
      </div>
      <div class="flex flex-col px-1 items-center md:border-r-2">
        <div class="w-5">
          <font-awesome-icon icon="fa fa-list-ul fa-lg" />
        </div>
        <div class="text-xs font-medium">
          {{ state.TotalProjectTimeEntry }} Units
        </div>
      </div>
    </div>

    <div class="desk-menu">
      <alp-can-any :permissions="['Notification.View']">
        <!-- Notifiaction dropdown  -->
        <Menu
          as="div"
          class="relative inline-block text-left z-40"
          v-slot="{ open }"
        >
          <div>
            <MenuButton
              class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
              title="Notifications"
            >
              <font-awesome-icon
                icon="fa-solid fa-bell fa-lg"
                class="cursor-pointer w-5 h-5"
                :class="{ 'animate-bell': hasNotifications }"
              />
              <span
                v-if="hasNotifications"
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
            <div
              v-show="open || state.isNotification"
              class="fixed right-0 md:absolute"
            >
              <MenuItems
                class="mt-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none md:w-96"
                static
              >
                <div>
                  <notification-menu
                    :isLockIcon="true"
                    :currentLockState="state.isNotification"
                    :lockIconClick="handleNotificationLockIconClick"
                  />
                </div>
              </MenuItems>
            </div>
          </transition>
        </Menu>
      </alp-can-any>
      <!-- Notifiaction dropdown end  -->

      <!-- Email popup  -->
      <alp-can-any :permissions="['Email.View']">
        <Menu as="div" class="relative inline-block text-left z-40">
          <div>
            <MenuButton
              class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
              title="Compose Email"
              @click="state.isEmail = true"
            >
              <font-awesome-icon
                icon="fa-solid fa-envelope-open-text fa-lg"
                class="cursor-pointer w-5 h-5"
              />
              <span
                v-if="hasDraft"
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
            </MenuButton>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div v-show="state.isEmail" class="fixed right-0 bottom-0">
                <MenuItems
                  class="origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  static
                  v-slot="{ open }"
                >
                  <email-menu
                    :isOpen="open"
                    :isLockIcon="true"
                    :currentLockState="state.isEmail"
                    :lockIconClick="handleEmailLockIconClick"
                  />
                </MenuItems>
              </div>
            </transition>
          </div>
        </Menu>
      </alp-can-any>
      <!-- Email popup end -->

      <alp-can-any :permissions="['Reminder.View']">
        <!-- Reminder Menu  -->
        <Menu
          as="div"
          class="relative inline-block text-left z-40"
          v-slot="{ open }"
        >
          <div>
            <MenuButton
              class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
              title="Reminders"
            >
              <font-awesome-icon
                icon="fa-solid fa-note-sticky fa-lg"
                class="cursor-pointer w-5 h-5"
              />
            </MenuButton>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-show="open || state.isReminder"
                class="fixed right-0 md:absolute"
              >
                <MenuItems
                  class="origin-top-right mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  static
                >
                  <reminder-menu
                    :isLockIcon="true"
                    :currentLockState="state.isReminder"
                    :lockIconClick="handleRimderLockIconClick"
                  />
                </MenuItems>
              </div>
            </transition>
          </div>
        </Menu>
      </alp-can-any>
      <!-- Reminder Menu end  -->

      <!-- Timers dropdown  -->
      <alp-can-any :permissions="['Matter.View', 'Project.View']">
        <Menu
          as="div"
          class="relative inline-block text-left z-40"
          v-slot="{ open }"
        >
          <div>
            <MenuButton
              @click="getTimersData"
              class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
              title="Timers"
            >
              <font-awesome-icon
                icon="fa-solid fa-stopwatch fa-lg"
                class="cursor-pointer w-5 h-5"
              />
              <alp-loader
                v-if="hasActiveTimer"
                class="absolute animate-spin text-blue-600"
                size="30"
              />
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
            <div
              v-show="open || state.isTimer"
              class="fixed right-0 md:absolute"
            >
              <MenuItems
                class="origin-top-right mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <timer-menu
                  :isLockIcon="true"
                  :currentLockState="state.isTimer"
                  :lockIconClick="handleTimerLockIconClick"
                />
              </MenuItems>
            </div>
          </transition>
        </Menu>
      </alp-can-any>

      <!-- Timers dropdown end -->

      <!--Document Menu-->
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
            title="Documents"
          >
            <font-awesome-icon
              icon="fa-solid fa-file-circle-question fa-lg"
              class="cursor-pointer w-5 h-5"
            />
            <alp-loader
              v-if="hasActiveDocument"
              class="absolute animate-spin text-blue-600"
              size="30"
            />
            <span
              v-if="
                hasIncompleteReviewRequest ||
                hasUnacknowledgedCompletedDocumentReview
              "
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
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="open || state.isDocuments"
              class="fixed right-0 md:absolute"
            >
              <MenuItems
                class="origin-top-right mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <document-menu
                  :isLockIcon="true"
                  :currentLockState="state.isDocuments"
                  :lockIconClick="handleDocumentLockIconClick"
                />
              </MenuItems>
            </div>
          </transition>
        </div>
      </Menu>
      <!--Document Menu end>-->

      <!-- Downloads dropdown  -->
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
            title="Downloads"
          >
            <font-awesome-icon
              icon="fa-solid fa-file-arrow-down fa-lg"
              class="cursor-pointer w-5 h-5"
              :has-alert="true"
            />
            <alp-loader
              v-if="hasPendingDownloads"
              class="absolute animate-spin text-blue-600"
              size="30"
            />
            <span
              class="animate-ping absolute inline-flex h-2 w-2 right-2 top-1 rounded-full bg-red-400 opacity-75"
              v-if="hasDownloads"
            ></span>
            <span
              class="absolute inline-flex rounded-full h-2 w-2 right-2 top-1 bg-red-500"
              v-if="hasDownloads"
            ></span>
          </MenuButton>
        </div>

        <!-- Download dropndown -->
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-show="open || state.isDownloadClicked"
            class="fixed right-0 md:absolute"
          >
            <MenuItems
              class="origin-top-right mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              static
            >
              <div>
                <download-menu
                  :isLockIcon="true"
                  :currentLockState="state.isDownloadClicked"
                  :lockIconClick="handleDownloadLockIconClick"
                />
              </div>
            </MenuItems>
          </div>
        </transition>
      </Menu>
      <!-- Download dropndown end -->

      <!-- add function dropdown -->
      <Menu as="div" class="relative inline-block text-left z-40">
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
            title="Quick Add"
          >
            <font-awesome-icon
              icon="fa-solid fa-square-plus fa-lg"
              class="cursor-pointer w-5 h-5"
            />
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
          <div class="fixed right-0 md:absolute">
            <MenuItems
              class="origin-top-right w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="flex flex-wrap">
                <div
                  class="w-full text-center bg-gray-100 p-2 font-semibold uppercase text-black"
                >
                  Add
                </div>
                <div class="w-full gap-3 grid grid-cols-3 p-4">
                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm  font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateContact, {})"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-id-card fa-2xl"
                        class="flex mb-1 w-8 h-8"
                      />Contact
                    </a>
                  </MenuItem>

                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm  font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateOrganisation, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa fa-building-user fa-2xl"
                      />
                      Organization
                    </a>
                  </MenuItem>

                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateClient, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa-solid fa-address-book fa-2xl"
                      />Client
                    </a>
                  </MenuItem>
                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateMatter, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa-solid fa-gavel fa-2xl"
                      />Matter
                    </a>
                  </MenuItem>

                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateTimeEntry, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa-solid fa-clock fa-2xl"
                      />Time Entry
                    </a>
                  </MenuItem>

                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateInvoice, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa fa-file-invoice-dollar fa-2xl"
                      />Invoice
                    </a>
                  </MenuItem>

                  <MenuItem
                    v-slot="{ active }"
                    class="flex flex-col w-full items-center"
                  >
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                        'block p-2.5 text-sm font-medium rounded	'
                      ]"
                      @click="showModal(ModalType.CreateProject, {})"
                    >
                      <font-awesome-icon
                        class="flex mb-1 w-8 h-8"
                        icon="fa fa-list-ul fa-2xl"
                      />Project
                    </a>
                  </MenuItem>
                </div>
              </div>
            </MenuItems>
          </div>
        </transition>
      </Menu>

      <!-- Staff Directory dropdown -->
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
            title="Staff Directory"
            @click="state.isStaffDirectory = true"
          >
            <font-awesome-icon
              icon="fa-regular fa-id-badge fa-lg"
              class="cursor-pointer w-5 h-5"
            />
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-show="state.isStaffDirectory" class="fixed right-0 bottom-0">
              <MenuItems
                class="origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <staff-directory
                  :isOpen="open"
                  :isLockIcon="true"
                  :currentLockState="state.isStaffDirectory"
                  :lockIconClick="handleStaffDirectoryLockIconClick"
                  @close="state.isStaffDirectory = false"
                />
              </MenuItems>
            </div>
          </transition>
        </div>
      </Menu>

      <!-- Admin Button -->

      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-if="
          canAny(['Roles.View', 'ResourceDocument.Edit', 'SyntaqForm.Edit'])
        "
      >
        <MenuButton
          class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
          title="Administration"
          @click="showAdminMenu"
        >
          <font-awesome-icon
            icon="fa-solid fa-user-tie"
            class="cursor-pointer w-5 h-5"
          />
        </MenuButton>
      </Menu>

      <!-- profile dropdown -->
      <Menu as="div" class="relative inline-block text-left z-40">
        <div>
          <MenuButton class="items-center outline-none focus:outline-none">
            <div
              class="w-8 h-8 ml-2 bg-cover border rounded bg-gray-100 mt-1"
              aria-hidden="true"
              :style="{
                backgroundImage:
                  'url(\'' +
                  (currentUser?.profilePictureUrl ||
                    '/default-profile-picture.png') +
                  '\')'
              }"
            ></div>
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
            class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="py-1">
              <MenuItem v-slot="{ active }">
                <div
                  class="border-b border-gray-300 cursor-pointer"
                  :class="[
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-sm'
                  ]"
                  @click="redirectToPorfilePage"
                >
                  {{ currentUser?.firstName + " " + currentUser?.lastName }}
                  <br />
                  {{ currentUser?.email }}
                </div>
              </MenuItem>
              <form method="POST" action="#">
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full text-left px-4 py-2 text-sm'
                    ]"
                    @click="logOut"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </form>
              <MenuItem v-slot="{ active }">
                <a
                  href="#"
                  class="border-t border-gray-300"
                  :class="[
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-sm'
                  ]"
                  @click="copyApplicationVersion"
                >
                  Version {{ apiVersion }}
                </a>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
  <div class="flex items-center ml-auto mobile-menus">
    <alp-can-any :permissions="['Notification.View']">
      <!-- Notifiaction dropdown  -->
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
          >
            <font-awesome-icon
              icon="fa-solid fa-bell fa-lg"
              class="cursor-pointer w-5 h-5"
            />
            <span
              v-if="hasNotifications"
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
          <div
            v-show="open || state.isNotification"
            class="fixed right-0 md:absolute bottom-60"
          >
            <MenuItems
              class="mt-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none w-80 md:w-96"
              static
            >
              <div>
                <notification-menu
                  :isLockIcon="true"
                  :currentLockState="state.isNotification"
                  :lockIconClick="handleNotificationLockIconClick"
                />
              </div>
            </MenuItems>
          </div>
        </transition>
      </Menu>
    </alp-can-any>
    <!-- Notifiaction dropdown end  -->

    <!-- Email popup  -->
    <alp-can-any :permissions="['Email.View']">
      <Menu as="div" class="relative inline-block text-left z-40">
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
            @click="state.isEmail = true"
          >
            <font-awesome-icon
              icon="fa-solid fa-envelope-open-text fa-lg"
              class="cursor-pointer w-5 h-5"
            />
            <span
              v-if="hasDraft"
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
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-show="state.isEmail" class="fixed right-0 bottom-0">
              <MenuItems
                class="origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <email-menu
                  :isOpen="open"
                  :isLockIcon="true"
                  :currentLockState="state.isEmail"
                  :lockIconClick="handleEmailLockIconClick"
                />
              </MenuItems>
            </div>
          </transition>
        </div>
      </Menu>
    </alp-can-any>
    <!-- Email popup end -->

    <alp-can-any :permissions="['Reminder.View']">
      <!-- Reminder Menu  -->
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
          >
            <font-awesome-icon
              icon="fa-solid fa-note-sticky fa-lg"
              class="cursor-pointer w-5 h-5"
            />
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="open || state.isReminder"
              class="fixed right-0 md:absolute bottom-60"
            >
              <MenuItems
                class="origin-top-right mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <reminder-menu
                  :isLockIcon="true"
                  :currentLockState="state.isReminder"
                  :lockIconClick="handleRimderLockIconClick"
                />
              </MenuItems>
            </div>
          </transition>
        </div>
      </Menu>
    </alp-can-any>
    <!-- Reminder Menu end  -->

    <!-- Timers dropdown  -->
    <alp-can-any :permissions="['Matter.View', 'Project.View']">
      <Menu
        as="div"
        class="relative inline-block text-left z-40"
        v-slot="{ open }"
      >
        <div>
          <MenuButton
            @click="getTimersData"
            class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
          >
            <font-awesome-icon
              icon="fa-solid fa-stopwatch fa-lg"
              class="cursor-pointer w-5 h-5"
            />
            <alp-loader
              v-if="hasActiveTimer"
              class="animate-spin text-blue-600"
              size="30"
            />
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
          <div
            v-show="open || state.isTimer"
            class="fixed right-0 md:absolute bottom-60"
          >
            <MenuItems
              class="origin-top-right mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              static
            >
              <timer-menu
                :isLockIcon="true"
                :currentLockState="state.isTimer"
                :lockIconClick="handleTimerLockIconClick"
              />
            </MenuItems>
          </div>
        </transition>
      </Menu>
    </alp-can-any>

    <!-- Timers dropdown end -->

    <!--Document Menu-->
    <Menu
      as="div"
      class="relative inline-block text-left z-40"
      v-slot="{ open }"
    >
      <div>
        <MenuButton
          class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
        >
          <font-awesome-icon
            icon="fa-solid fa-file-circle-question fa-lg"
            class="cursor-pointer w-5 h-5"
          />
          <alp-loader
            v-if="hasActiveDocument"
            class="absolute animate-spin text-blue-600"
            size="30"
          />
          <span
            v-if="
              hasIncompleteReviewRequest ||
              hasUnacknowledgedCompletedDocumentReview
            "
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
        </MenuButton>

        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-show="open || state.isDocuments"
            class="fixed right-0 md:absolute bottom-60"
          >
            <MenuItems
              class="origin-top-right mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              static
            >
              <document-menu
                :isLockIcon="true"
                :currentLockState="state.isDocuments"
                :lockIconClick="handleDocumentLockIconClick"
              />
            </MenuItems>
          </div>
        </transition>
      </div>
    </Menu>
    <!--Document Menu end>-->

    <!-- Downloads dropdown  -->
    <Menu
      as="div"
      class="relative inline-block text-left z-40"
      v-slot="{ open }"
    >
      <div>
        <MenuButton
          class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
        >
          <font-awesome-icon
            icon="fa-solid fa-file-arrow-down fa-lg"
            class="cursor-pointer w-5 h-5"
            :has-alert="true"
          />
          <alp-loader
            v-if="hasPendingDownloads"
            class="absolute animate-spin text-blue-600"
            size="30"
          />
          <span
            class="animate-ping absolute inline-flex h-2 w-2 right-2 top-1 rounded-full bg-red-400 opacity-75"
            v-if="hasDownloads"
          ></span>
          <span
            class="absolute inline-flex rounded-full h-2 w-2 right-2 top-1 bg-red-500"
            v-if="hasDownloads"
          ></span>
        </MenuButton>
      </div>

      <!-- Download dropndown -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open || state.isDownloadClicked"
          class="fixed right-0 md:absolute bottom-60"
        >
          <MenuItems
            class="origin-top-right mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            static
          >
            <div>
              <download-menu
                :isLockIcon="true"
                :currentLockState="state.isDownloadClicked"
                :lockIconClick="handleDownloadLockIconClick"
              />
            </div>
          </MenuItems>
        </div>
      </transition>
    </Menu>
    <!-- Download dropndown end -->

    <!-- add function dropdown -->
    <Menu as="div" class="relative inline-block text-left z-40">
      <div>
        <MenuButton
          class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
        >
          <font-awesome-icon
            icon="fa-solid fa-square-plus fa-lg"
            class="cursor-pointer w-5 h-5"
          />
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
        <div class="fixed right-0 md:absolute bottom-60">
          <MenuItems
            class="origin-top-right w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="flex flex-wrap">
              <div
                class="w-full text-center bg-gray-100 p-2 font-semibold uppercase text-black"
              >
                Add
              </div>
              <div class="w-full gap-3 grid grid-cols-3 p-4">
                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm  font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateContact, {})"
                  >
                    <font-awesome-icon
                      icon="fa-solid fa-id-card fa-2xl"
                      class="flex mb-1 w-8 h-8"
                    />Contact
                  </a>
                </MenuItem>

                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm  font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateOrganisation, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa fa-building-user fa-2xl"
                    />
                    Organization
                  </a>
                </MenuItem>

                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateClient, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa-solid fa-address-book fa-2xl"
                    />Client
                  </a>
                </MenuItem>
                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateMatter, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa-solid fa-gavel fa-2xl"
                    />Matter
                  </a>
                </MenuItem>

                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateTimeEntry, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa-solid fa-clock fa-2xl"
                    />Time Entry
                  </a>
                </MenuItem>

                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateInvoice, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa fa-file-invoice-dollar fa-2xl"
                    />Invoice
                  </a>
                </MenuItem>

                <MenuItem
                  v-slot="{ active }"
                  class="flex flex-col w-full items-center"
                >
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500',
                      'block p-2.5 text-sm font-medium rounded	'
                    ]"
                    @click="showModal(ModalType.CreateProject, {})"
                  >
                    <font-awesome-icon
                      class="flex mb-1 w-8 h-8"
                      icon="fa fa-list-ul fa-2xl"
                    />Project
                  </a>
                </MenuItem>
              </div>
            </div>
          </MenuItems>
        </div>
      </transition>
    </Menu>

    <!-- Staff Directory dropdown -->
    <Menu
      as="div"
      class="relative inline-block text-left z-40"
      v-slot="{ open }"
    >
      <div>
        <MenuButton
          class="items-center outline-none text-gray-500 hover:text-black flex justify-center rounded p-2 hover:bg-gray-100 focus:outline-none"
          @click="state.isStaffDirectory = true"
        >
          <font-awesome-icon
            icon="fa-regular fa-id-badge fa-lg"
            class="cursor-pointer w-5 h-5"
          />
        </MenuButton>

        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div v-show="state.isStaffDirectory" class="fixed right-0 bottom-0">
            <MenuItems
              class="origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              static
            >
              <staff-directory
                :isOpen="open"
                :isLockIcon="true"
                :currentLockState="state.isStaffDirectory"
                :lockIconClick="handleStaffDirectoryLockIconClick"
                @close="state.isStaffDirectory = false"
              />
            </MenuItems>
          </div>
        </transition>
      </div>
    </Menu>

    <!-- profile dropdown -->
    <Menu as="div" class="relative inline-block text-left z-40">
      <div>
        <MenuButton class="items-center outline-none focus:outline-none">
          <div
            class="w-8 h-8 ml-2 bg-cover border rounded bg-gray-100 mt-1"
            aria-hidden="true"
            :style="{
              backgroundImage:
                'url(\'' +
                (currentUser?.profilePictureUrl ||
                  '/default-profile-picture.png') +
                '\')'
            }"
          ></div>
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
          class="origin-top-right absolute right-0 mt-2 w-56 bottom-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="py-1">
            <MenuItem v-slot="{ active }">
              <div
                class="border-b border-gray-300 cursor-pointer"
                :class="[
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-2 text-sm'
                ]"
                @click="redirectToPorfilePage"
              >
                {{ currentUser?.firstName + " " + currentUser?.lastName }}
                <br />
                {{ currentUser?.email }}
              </div>
            </MenuItem>
            <MenuItem
              v-slot="{ active }"
              v-if="
                canAny([
                  'Roles.View',
                  'ResourceDocument.Edit',
                  'SyntaqForm.Edit'
                ])
              "
            >
              <a
                href="#"
                :class="[
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-2 text-sm'
                ]"
                @click="showAdminMenu"
              >
                <b>Administration</b>
              </a>
            </MenuItem>
            <form method="POST" action="#">
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  :class="[
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full text-left px-4 py-2 text-sm'
                  ]"
                  @click="logOut"
                >
                  Sign out
                </button>
              </MenuItem>
            </form>
            <MenuItem v-slot="{ active }">
              <a
                href="#"
                class="border-t border-gray-300"
                :class="[
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-2 text-sm'
                ]"
                @click="copyApplicationVersion"
              >
                Version {{ apiVersion }}
              </a>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import EmailMenu from "@/components/ui/layout/EmailMenu.vue";
import { CurrentUserDto } from "@/network/accounts-service-proxies";
import { ApiInfoStore } from "@/store/modules/api";
import { PermissionStore } from "@/store/modules/permissions";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { UserStore } from "@/store/modules/users";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  unref,
  watch
} from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { useStore } from "vuex";
import ReminderMenu from "./ReminderMenu.vue";
import DocumentMenu from "./DocumentMenu.vue";
import { ModalStore, ModalType } from "@/store/modules/modals";
import NotificationMenu from "./NotificationMenu.vue";
import DownloadMenu from "./DownloadMenu.vue";
import TimerMenu from "./TimerMenu.vue";
import StaffDirectory from "./StaffDirectory.vue";
import { SendEmailStore } from "@/store/modules/send-email";
import {
  CreateTimerInput,
  TimeEntryServiceProxy,
  TimeEntryStatsDto,
  TimerDto,
  TimerType,
  TypeTotalUnitsDto,
  UserListDto
} from "@/network/common-service-proxies";
import { ApiStore } from "@/store/utils";
import { useCan } from "@/composable/can";
import { AuthStore } from "@/store/modules/auth";
import { useRouter } from "vue-router";
import { DownloadStore } from "@/store/modules/downloads";
import { useClipboard } from "@vueuse/core";
import { useNotify } from "@/composable/notify";
import { FilterState } from "@/store/filterState";
import { DataTableStore } from "@/store/modules/datatable";
import { Toaster } from "@/lib/registry/new-york/ui/sonner";
import { DateTime } from "luxon";

const { canAny } = useCan();
const store = useStore();
const state = reactive({
  msg: false,
  isMenuClicked: false,
  isTimer: false,
  isDownloadClicked: false,
  isReminder: false,
  isNotification: false,
  isDocuments: false,
  isEmail: false,
  isStaffDirectory: false,
  user: new UserListDto(),
  TotalTimeEntry: new TimeEntryStatsDto(),
  TotalSalesTimeEntry: 0,
  TotalMatterTimeEntry: 0,
  TotalProjectTimeEntry: 0
});
onMounted(() => {
  store.dispatch(UserStore.actions.GET_ME);
  store.dispatch(TimeEntryStore.actions.GET_TIMERS);
  store.dispatch(PermissionStore.actions.UPDATE_PERMISSIONS);
  store.dispatch(ApiInfoStore.actions.GET_API_VERSION);
});
const routers = useRouter();

let adminUrl: any;

function resetFilterState() {
  let filterState = new FilterState();
  filterState.clearAllFilterStates();
}
resetFilterState();
const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

const hasDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_DOWNLOADS]
);
const hasPendingDownloads = computed(
  () => store.getters[DownloadStore.getters.GET_HAS_PENDING_DOWNLOADS]
);
const hasDraft = computed(
  () => store.getters[SendEmailStore.getters.HAVE_DRAFT]
);

const timers = computed(
  () =>
    ApiStore.toData<TimerDto[]>(
      store.getters[TimeEntryStore.getters.GET_TIMERS]
    ) || []
);
const apiVersion = computed(
  () => store.getters[ApiInfoStore.getters.GET_API_VERSION]
);
const unitsCreateCount = computed(
  () => store.getters[TimeEntryStore.getters.CREATE_COUNT]
);

const emailModalOpenCount = computed(
  () => store.getters[SendEmailStore.getters.EMAIL_MODAL_OPEN]
);

function createTimer() {
  store.dispatch(
    TimeEntryStore.actions.CREATE_TIMER,
    new CreateTimerInput({
      type: TimerType.Free
    })
  );
}

function getTimersData() {
  store.dispatch(TimeEntryStore.actions.GET_TIMERS);
}

const handleExpand = () => {
  if (state.isMenuClicked == true) return (state.msg = false);
  return false;
};

const handleClose = () => {
  if (state.isMenuClicked == true) return (state.msg = true);
  return false;
};

const handleMenuClick = () => {
  state.isMenuClicked = !state.isMenuClicked;
  if (state.isMenuClicked == true) state.msg = true;
  else state.msg = false;
};

const emits = defineEmits(["updateValue"]);

function showAdminMenu() {
  emits("updateValue", true);
}

function handleRimderLockIconClick() {
  state.isReminder = !state.isReminder;
}
function handleDocumentLockIconClick() {
  state.isDocuments = !state.isDocuments;
}
function handleDownloadLockIconClick() {
  state.isDownloadClicked = !state.isDownloadClicked;
}
function handleNotificationLockIconClick() {
  state.isNotification = !state.isNotification;
}

function handleTimerLockIconClick() {
  state.isTimer = !state.isTimer;
}

function handleStaffDirectoryLockIconClick() {
  state.isStaffDirectory = false;
}

function handleEmailLockIconClick() {
  state.isEmail = false;
}
function showModal(type: ModalType, props: Record<string, unknown>) {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: type,
    props
  });
}

const hasActiveDocument = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasActiveDocument
);

const hasIncompleteReviewRequest = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasIncompleteReviewRequest
);
const hasActiveTimer = computed(
  () => store.getters[TimeEntryStore.getters.HAS_ACTIVE_TIMER]
);

const hasUnacknowledgedCompletedDocumentReview = computed(
  () =>
    store.getters[UserStore.getters.GET_ME]?.hasUnacknowledgedCompletedReview
);

const hasNotifications = computed(
  () => store.getters[UserStore.getters.GET_ME]?.hasNotifications
);

const router = useRouter();
function logOut() {
  store.dispatch(AuthStore.actions.LOGOUT).then(() => {
    router.push({ name: "Login" });
  });
}

function redirectToPorfilePage() {
  router.push("/user/me");
}

const { copy } = useClipboard();
const { fireSuccessToast } = useNotify();

function copyApplicationVersion() {
  if (unref(apiVersion)) {
    copy("version " + unref(apiVersion)).then(() =>
      fireSuccessToast("Application version copied to clipboard")
    );
  }
}

function handleMobileviewNatigation() {
  if (window.innerWidth < 300) handleMenuClick();
}
function OpenEmailPopup() {
  state.isEmail = true;
}
const handleMenuMobileClick = () => {
  state.isMenuClicked = true;
  state.msg = true;
  handleClose();
};
let mobileWidth: any;
// const routers = useRouter()
// const currentRouteName = computed(() => routers.currentRoute.value.name);

async function fetchTimeEntryData() {

  if (currentUser?.value?.id){
    await new TimeEntryServiceProxy()
      .getTimeEntryStats(
        DateTime.local().startOf("day"),
        DateTime.local().endOf("day"),
        currentUser?.value?.id
      )
      .then(async (result) => {
        state.TotalTimeEntry.typeTotalUnits = result!
          .typeTotalUnits as TypeTotalUnitsDto[];

        state.TotalSalesTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[0].totalUnits!;
        state.TotalMatterTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[1].totalUnits!;
        state.TotalProjectTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[2].totalUnits!;
      });
  }
}
function FetchUnitData() {
  fetchTimeEntryData();
}

watch(
  [() => emailModalOpenCount],
  () => {
    OpenEmailPopup();
  },
  { deep: true }
);

watch(
  () => currentUser.value,
  () => {
    FetchUnitData();
  },
  { immediate: true, deep: true }
);

watch(
  () => unitsCreateCount,
  () => {
    FetchUnitData();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.t:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}
.hide-for-small-screen {
  @apply hidden;
}
</style>
