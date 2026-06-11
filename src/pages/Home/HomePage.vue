<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      class="tagam-home-header tagam-surface tagam-text-main"
      :class="{ 'tagam-home-header--filtering': hasSelectedCuisineFilter }"
    >
      <InstallPwa></InstallPwa>
      <div class="q-pl-sm q-pr-sm">
        <q-toolbar
          v-if="!isScrolled && !hasSelectedCuisineFilter"
          class="tagam-home-brand-toolbar"
        >
          <q-toolbar-title class="tagam-home-brand-block">
            <div class="tagam-home-wordmark" aria-label="TAGAM">
              <svg viewBox="0 0 245 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M213.147 0C215.52 0 217.877 0.400375 220.087 1.18555C222.297 1.97072 224.329 3.12985 226.059 4.61362C227.789 6.09801 229.188 7.88325 230.153 9.87991C231.118 11.8785 231.622 14.0396 231.622 16.2349L226.215 16.2349C226.215 14.8769 225.904 13.5193 225.284 12.2352C224.663 10.9491 223.738 9.75067 222.539 8.72254C221.34 7.69388 219.895 6.85997 218.278 6.28537C216.661 5.71075 214.916 5.41162 213.147 5.41162C211.377 5.41162 209.633 5.71075 208.015 6.28537C206.398 6.85997 204.953 7.69388 203.754 8.72254C202.555 9.75067 201.631 10.9491 201.01 12.2352C200.39 13.5193 200.078 14.8769 200.078 16.2349H194.671C194.671 14.0396 195.176 11.8786 196.141 9.87991C197.105 7.88325 198.504 6.09801 200.234 4.61362C201.964 3.12985 203.996 1.97072 206.206 1.18555C208.416 0.400374 210.773 0 213.147 0Z" fill="currentColor"/>
                <path d="M245 9.01953V53H238.676V14.9187C238.119 15.0844 237.366 15.3331 236.418 15.6645C235.484 15.981 234.423 16.3727 233.233 16.8399C232.044 17.307 230.764 17.8494 229.394 18.4672C228.039 19.0699 226.661 19.748 225.261 20.5014C223.861 21.2397 222.468 22.0459 221.083 22.9198C219.712 23.7787 218.425 24.6979 217.221 25.6773C218.229 26.9581 219.005 28.2087 219.547 29.4292C220.089 30.6347 220.443 31.7045 220.608 32.6387C220.789 33.5729 220.879 34.3942 220.879 35.1024C220.879 35.3886 220.849 35.8407 220.789 36.4585C220.744 37.0763 220.593 37.7769 220.337 38.5605C220.096 39.3289 219.795 39.9995 219.434 40.5721C219.073 41.1446 218.719 41.5892 218.372 41.9056C217.665 42.5686 216.852 43.0508 215.933 43.3521C215.015 43.6535 214.081 43.8042 213.133 43.8042C212.109 43.8042 211.123 43.6384 210.174 43.3069C209.226 42.9905 208.428 42.5234 207.78 41.9056C207.042 41.2125 206.44 40.2858 205.973 39.1255C205.522 37.9653 205.296 36.6619 205.296 35.2154C205.296 33.7688 205.574 32.2319 206.131 30.6045C206.704 28.9621 207.637 27.3197 208.932 25.6773C207.863 24.8033 206.726 23.9746 205.522 23.191C204.332 22.4075 203.105 21.6692 201.84 20.976C200.591 20.2678 199.326 19.6124 198.046 19.0097C196.766 18.3919 195.509 17.8343 194.274 17.3371C193.055 16.8248 191.865 16.3652 190.706 15.9584C189.561 15.5515 188.485 15.205 187.476 14.9187V53H181.152V9.01953H186.889C188.048 9.33596 189.328 9.73526 190.728 10.2174C192.129 10.6846 193.589 11.2195 195.11 11.8222C196.646 12.4249 198.212 13.0954 199.808 13.8338C201.419 14.557 203 15.3406 204.55 16.1844C206.101 17.0282 207.599 17.9248 209.045 18.874C210.505 19.8233 211.853 20.8103 213.088 21.8349C214.518 20.6445 216.152 19.4542 217.988 18.2638C219.825 17.0734 221.843 15.9282 224.041 14.8283C226.255 13.7132 228.634 12.666 231.178 11.6866C233.738 10.6921 236.44 9.80307 239.286 9.01953H245ZM215.12 35.3736C215.12 34.3188 214.94 33.3168 214.578 32.3675C214.217 31.4031 213.72 30.4689 213.088 29.5648C212.455 30.4689 211.958 31.4031 211.597 32.3675C211.236 33.3168 211.055 34.3188 211.055 35.3736C211.055 35.7352 211.077 36.0968 211.123 36.4585C211.183 36.8201 211.281 37.1516 211.416 37.453C211.567 37.7543 211.778 38.003 212.049 38.1988C212.32 38.3797 212.673 38.4701 213.11 38.4701C213.532 38.4701 213.87 38.3721 214.126 38.1762C214.397 37.9804 214.601 37.7317 214.736 37.4304C214.887 37.129 214.985 36.7975 215.03 36.4359C215.09 36.0592 215.12 35.7051 215.12 35.3736Z" fill="currentColor"/>
                <path d="M176.347 9.30967V42.4443H170.181V39.2348C170.181 37.6376 170.053 36.0555 169.798 34.4884C169.557 32.9213 169.18 31.3844 168.668 29.8776C168.563 29.5461 168.39 29.0639 168.149 28.431C167.908 27.7831 167.584 27.0523 167.178 26.2386C166.771 25.4099 166.267 24.5284 165.664 23.5942C165.062 22.6449 164.332 21.7107 163.474 20.7915C162.631 19.8573 161.652 18.9608 160.538 18.1019C159.423 17.243 158.144 16.4896 156.698 15.8417C155.253 15.1787 153.634 14.6513 151.842 14.2595C150.066 13.8678 148.086 13.6719 145.903 13.6719C144.005 13.6719 142.312 13.8376 140.821 14.1691C139.345 14.4855 138.051 14.9301 136.936 15.5026C135.822 16.0602 134.874 16.7232 134.091 17.4916C133.323 18.2601 132.698 19.0964 132.216 20.0005C131.734 20.9045 131.373 21.8538 131.132 22.8483C130.906 23.8428 130.786 24.8448 130.771 25.8544C130.771 25.9147 130.771 25.9674 130.771 26.0126C130.771 26.8866 130.884 27.7906 131.109 28.7249C131.335 29.6591 131.697 30.5782 132.193 31.4823C132.69 32.3864 133.315 33.2378 134.068 34.0364C134.821 34.835 135.709 35.5356 136.733 36.1384C137.757 36.726 138.916 37.1931 140.211 37.5397C141.506 37.8862 142.936 38.0595 144.502 38.0595C146.264 38.0595 148.003 37.8109 149.719 37.3137C151.451 36.8164 153.107 36.0555 154.688 35.0309C156.284 33.9912 157.782 32.6727 159.183 31.0755C160.583 29.4783 161.833 27.5872 162.932 25.4024L167.607 27.753C165.032 32.8761 161.787 36.7486 157.873 39.3705C153.958 41.9772 149.479 43.2806 144.435 43.2806C144.013 43.2806 143.478 43.2806 142.831 43.2806C142.184 43.2806 141.453 43.2354 140.64 43.145C139.827 43.0697 138.946 42.9265 137.998 42.7156C137.049 42.5046 136.063 42.1882 135.039 41.7663C134.015 41.3444 132.969 40.8019 131.9 40.1389C130.846 39.4609 129.807 38.6171 128.783 37.6075C127.142 35.9952 125.907 34.2021 125.079 32.2282C124.266 30.2543 123.86 28.205 123.86 26.0804C123.86 25.9749 123.86 25.8619 123.86 25.7414C123.89 24.3551 124.108 22.9689 124.515 21.5826C124.936 20.1813 125.546 18.8402 126.344 17.5594C127.157 16.2786 128.166 15.0883 129.37 13.9883C130.575 12.8733 131.99 11.9089 133.616 11.0952C135.242 10.2816 137.072 9.64116 139.104 9.17405C141.152 8.70694 143.418 8.47339 145.903 8.47339C148.101 8.47339 150.134 8.64667 152.001 8.99324C153.883 9.32473 155.614 9.78431 157.195 10.372C158.776 10.9596 160.221 11.6528 161.531 12.4514C162.841 13.25 164.031 14.1164 165.1 15.0506C166.169 15.9698 167.117 16.9341 167.946 17.9437C168.789 18.9382 169.534 19.9402 170.181 20.9497V9.30967H176.347Z" fill="currentColor"/>
                <path d="M98.7227 24.114H104.121C105.175 24.114 106.296 24.1216 107.486 24.1366C108.69 24.1366 109.932 24.1366 111.212 24.1366H121.624V42.4669H116.226V36.6356C115.278 37.5548 114.231 38.4212 113.087 39.2348C111.942 40.0334 110.67 40.7341 109.27 41.3368C107.87 41.9396 106.326 42.4142 104.64 42.7608C102.969 43.1073 101.124 43.2806 99.1067 43.2806C96.5922 43.2806 94.2735 43.0471 92.1505 42.58C90.0275 42.1128 88.1002 41.4725 86.3687 40.6588C84.6523 39.83 83.1391 38.8506 81.8291 37.7205C80.5192 36.5753 79.4201 35.3322 78.5317 33.9912C77.6584 32.635 76.9959 31.2036 76.5442 29.6968C76.0925 28.19 75.8667 26.6605 75.8667 25.1085C75.8667 23.5415 76.1678 22.0422 76.7701 20.6107C77.3724 19.1792 78.208 17.8533 79.277 16.6327C80.3461 15.3972 81.6259 14.2746 83.1165 13.265C84.6071 12.2555 86.2407 11.3966 88.0174 10.6884C89.7941 9.9802 91.6837 9.43774 93.6863 9.06104C95.7039 8.66927 97.7666 8.47339 99.8746 8.47339C101.952 8.47339 103.955 8.69188 105.882 9.12885C107.809 9.55076 109.616 10.1459 111.303 10.9144C113.004 11.6829 114.547 12.5945 115.932 13.6493C117.333 14.689 118.537 15.8191 119.546 17.0396L114.419 20.1587C114.284 19.9929 114.05 19.7292 113.719 19.3676C113.388 18.9909 112.944 18.5765 112.387 18.1245C111.845 17.6574 111.175 17.1827 110.377 16.7006C109.594 16.2033 108.668 15.7588 107.599 15.367C106.545 14.9602 105.34 14.6287 103.985 14.3725C102.63 14.1013 101.124 13.9657 99.468 13.9657C96.6073 13.9657 94.0853 14.3123 91.9021 15.0054C89.7188 15.6985 87.8895 16.6177 86.4139 17.7628C84.9383 18.893 83.8241 20.1813 83.0713 21.6278C82.3185 23.0743 81.9421 24.5585 81.9421 26.0804C81.9421 26.1106 81.9421 26.1407 81.9421 26.1708C81.9421 27.6475 82.3034 29.1016 83.0261 30.533C83.7489 31.9645 84.8254 33.2528 86.2558 34.398C87.6862 35.5281 89.4553 36.4397 91.5633 37.1328C93.6712 37.826 96.1029 38.1725 98.8582 38.1725C99.9724 38.1725 101.109 38.0746 102.269 37.8787C103.428 37.6828 104.557 37.3965 105.656 37.0198C106.755 36.6431 107.809 36.1911 108.818 35.6637C109.842 35.1363 110.768 34.5411 111.596 33.8781C112.439 33.2001 113.17 32.4693 113.787 31.6857C114.404 30.8871 114.863 30.0433 115.165 29.1543H98.7679C98.2861 29.1543 97.6989 29.1844 97.0063 29.2447C96.3137 29.2899 95.5684 29.3954 94.7703 29.5611C93.9874 29.7118 93.2421 29.9228 92.5344 30.194C91.8418 30.4652 91.2772 30.8043 90.8406 31.2111L87.2495 27.6174C87.8217 27.0749 88.4541 26.6153 89.1467 26.2386C89.8393 25.8619 90.5545 25.5455 91.2923 25.2893C92.03 25.0181 92.7678 24.8072 93.5056 24.6565C94.2434 24.5058 94.9435 24.3928 95.606 24.3175C96.2685 24.227 96.8708 24.1743 97.4128 24.1592C97.9548 24.1291 98.3915 24.114 98.7227 24.114Z" fill="currentColor"/>
                <path d="M72.7273 9.30967V42.4443H66.5616V39.2348C66.5616 37.6376 66.4336 36.0555 66.1777 34.4884C65.9367 32.9213 65.5603 31.3844 65.0484 29.8776C64.943 29.5461 64.7699 29.0639 64.5289 28.431C64.288 27.7831 63.9643 27.0523 63.5578 26.2386C63.1513 25.4099 62.6469 24.5284 62.0446 23.5942C61.4423 22.6449 60.7121 21.7107 59.8538 20.7915C59.0107 19.8573 58.032 18.9608 56.9178 18.1019C55.8036 17.243 54.5238 16.4896 53.0783 15.8417C51.6329 15.1787 50.0143 14.6513 48.2226 14.2595C46.4459 13.8678 44.4659 13.6719 42.2827 13.6719C40.3856 13.6719 38.6917 13.8376 37.2011 14.1691C35.7255 14.4855 34.4307 14.9301 33.3165 15.5026C32.2023 16.0602 31.2537 16.7232 30.4708 17.4916C29.7029 18.2601 29.078 19.0964 28.5962 20.0005C28.1144 20.9045 27.753 21.8538 27.5121 22.8483C27.2863 23.8428 27.1658 24.8448 27.1508 25.8544C27.1508 25.9147 27.1508 25.9674 27.1508 26.0126C27.1508 26.8866 27.2637 27.7906 27.4895 28.7249C27.7154 29.6591 28.0767 30.5782 28.5736 31.4823C29.0705 32.3864 29.6953 33.2378 30.4482 34.0364C31.201 34.835 32.0893 35.5356 33.1132 36.1384C34.1371 36.726 35.2964 37.1931 36.5913 37.5397C37.8862 37.8862 39.3165 38.0595 40.8824 38.0595C42.6441 38.0595 44.3831 37.8109 46.0996 37.3137C47.8311 36.8164 49.4873 36.0555 51.0683 35.0309C52.6643 33.9912 54.1624 32.6727 55.5627 31.0755C56.963 29.4783 58.2127 27.5872 59.3118 25.4024L63.9869 27.753C61.4122 32.8761 58.1675 36.7486 54.2528 39.3705C50.338 41.9772 45.8587 43.2806 40.8147 43.2806C40.3931 43.2806 39.8586 43.2806 39.2112 43.2806C38.5637 43.2806 37.8335 43.2354 37.0204 43.145C36.2073 43.0697 35.3265 42.9265 34.378 42.7156C33.4294 42.5046 32.4432 42.1882 31.4193 41.7663C30.3955 41.3444 29.349 40.8019 28.28 40.1389C27.226 39.4609 26.1871 38.6171 25.1633 37.6075C23.5221 35.9952 22.2875 34.2021 21.4593 32.2282C20.6463 30.2543 20.2397 28.205 20.2397 26.0804C20.2397 25.9749 20.2397 25.8619 20.2397 25.7414C20.2699 24.3551 20.4882 22.9689 20.8947 21.5826C21.3163 20.1813 21.9261 18.8402 22.7241 17.5594C23.5372 16.2786 24.546 15.0883 25.7505 13.9883C26.955 12.8733 28.3703 11.9089 29.9965 11.0952C31.6226 10.2816 33.452 9.64116 35.4846 9.17405C37.5323 8.70694 39.7984 8.47339 42.2827 8.47339C44.481 8.47339 46.5136 8.64667 48.3807 8.99324C50.2627 9.32473 51.9943 9.78431 53.5752 10.372C55.1562 10.9596 56.6016 11.6528 57.9115 12.4514C59.2215 13.25 60.4109 14.1164 61.48 15.0506C62.549 15.9698 63.4976 16.9341 64.3257 17.9437C65.1689 18.9382 65.9142 19.9402 66.5616 20.9497V9.30967H72.7273Z" fill="currentColor"/>
                <path d="M21.9788 9.03577V14.2569H16.197V42.1704H10.2572V14.2569H0V9.03577H21.9788Z" fill="currentColor"/>
              </svg>
            </div>
            <button
              type="button"
              class="tagam-location-tap tagam-home-address-row"
              v-ripple:purple
              @click="this.$refs.ref_address.modal = true"
            >
              <q-icon color="primary" name="near_me" size="16px"></q-icon>
              <div class="tagam-home-address-text ellipsis">
                <template v-if="searchMode == 'location'">
                  {{ DataStorePersisted.getLocationAddress }}
                </template>
                <template v-else>
                  {{
                    DataStorePersisted.hasPlaceData
                      ? DataStorePersisted.place_data.formatted_address
                      : $t("Select your location")
                  }}
                </template>
              </div>
            </button>
          </q-toolbar-title>
          <q-space></q-space>

          <div class="tagam-home-actions">
            <TopButtons
              :islogin="isLogin"
              :count="ClientStore.getAlertCount"
              :chatcount="ClientStore.getChatCount"
            ></TopButtons>
          </div>
        </q-toolbar>

        <q-space
          v-if="!hasSelectedCuisineFilter"
          class="q-pa-xs"
        ></q-space>

        <div v-if="!hasFilters && !isScrolled" class="tagam-home-masthead">
          <div class="tagam-home-masthead-copy">
            <div class="tagam-home-eyebrow">
              <q-icon name="eva-flash-outline" size="15px" />
              <span>{{ $t("Fast delivery") }}</span>
            </div>
            <div class="tagam-home-headline">
              {{ $t("What are you craving today?") }}
            </div>
          </div>
          <div class="tagam-home-orbit" aria-hidden="true">
            <div class="tagam-home-orbit-core">
              <img src="/icons/tagam-app-logo-512.png" alt="" />
            </div>
          </div>
        </div>

        <div
          class="tagam-search-control tagam-surface text-subtitle2 q-pa-sm q-pl-md q-pr-sm radius28 flex items-center justify-between cursor-pointer"
        >
          <div class="flex items-center col" @click="openHomeSearch">
            <q-icon
              color="primary"
              name="eva-search-outline"
              size="21px"
              class="q-mr-sm"
            ></q-icon>
            <div>
              <div class="tagam-search-label">
                {{ $t("Search") }}
              </div>
              <div class="tagam-search-hint">
                {{ $t("Restaurants, dishes, cuisines") }}
              </div>
            </div>
          </div>
          <div class="flex items-center q-gutter-x-xs">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="eva-mic-outline"
              size="13px"
              @click.stop="openHomeVoiceSearch"
            />
            <q-btn
              flat
              round
              dense
              :color="$q.dark.mode ? 'white' : 'dark'"
              icon="tune"
              size="13px"
              @click.stop="openHomeFilters"
            >
              <q-badge
                v-if="homeFilterCount > 0"
                color="primary"
                rounded
                floating
              >
                {{ homeFilterCount }}
              </q-badge>
            </q-btn>
          </div>
        </div>

        <div class="hidden">
          <FeedFilter
            ref="ref_feed_filter"
            @after-applyfilter="afterApplyfilter"
            @filter-unmount="filterUnmount"
            :search_mode="searchMode"
            :saved_filter="DataStore.filter_home"
          ></FeedFilter>
        </div>

        <!-- <q-intersection v-if="isSticky" transition="slide-down"> -->
        <!-- </q-intersection> -->

        <q-space
          v-if="!hasSelectedCuisineFilter"
          class="q-pa-xs"
        ></q-space>
      </div>
    </q-header>
    <q-page
      class="tagam-home-page q-pl-md q-pr-md"
      data-rebrand-revision="20260605-home-recommendations"
    >
      <q-scroll-observer @scroll="onScroll" />

      <q-space v-if="!hasSelectedCuisineFilter" class="q-pa-sm"></q-space>

      <template v-if="!hasFilters">
        <HomeBanner
          ref="home_banner"
          :filters="DataStore.filters"
          :search_mode="searchMode"
        />

        <FeaturedItems
          ref="ref_featured_items"
          :title="$t('Recommended dishes')"
        ></FeaturedItems>

        <q-space class="tagam-home-tight-gap"></q-space>
      </template>

      <div class="ref_sticky_target"></div>

      <div v-if="!hasSelectedCuisineFilter" class="tagam-home-cuisine-heading">
        <template v-if="DataStore.loading_cuisine">
          <div class="row justify-between">
            <q-skeleton type="text" style="width: 100px" />
            <q-skeleton type="text" style="width: 50px" />
          </div>
        </template>
        <div v-else class="row">
          <div class="col">
            <div class="tagam-section-title text-h6 text-weight-medium">
              {{ $t("Cuisine") }}
            </div>
          </div>
        </div>
      </div>

      <CuisineCarousel
        ref="cuisine_carousel"
        v-model:selectedCuisine="selectedHomeCuisines"
        :design="1"
        :search_mode="searchMode"
        selectable
        @after-getdata="afterGetdata"
        @after-select="afterCuisineSelect"
      />

      <q-space class="tagam-home-tight-gap"></q-space>

      <template v-if="!hasFilters">
        <component
          :is="MerchantCarousel"
          ref="merchantRefCarousel"
          list_type="featured"
          :featured_id="topResto"
          :filters="DataStore.filters"
          :index="0"
          :title="$t('Popular Near You')"
          :coordinates="DataStorePersisted.coordinates"
          :location_data="DataStorePersisted.getLocation"
        />

        <q-space class="q-pa-sm"></q-space>

        <component
          :is="MerchantCarousel"
          ref="merchantRefCarousel2"
          list_type="featured"
          featured_id="new"
          :filters="DataStore.filters"
          :index="1"
          :title="$t('New Restaurants')"
          :coordinates="DataStorePersisted.coordinates"
          :location_data="DataStorePersisted.getLocation"
        />

        <q-space class="q-pa-sm"></q-space>
      </template>

      <FeedResults
        ref="ref_feed_results"
        :title="$t('Explore Restaurants')"
        :filters="DataStore.feed_filter"
        :full_page="hasFilters"
        :no_data_label="
          $t('No restaurants available in this category in your area.')
        "
        :currency_code="DataStorePersisted.useCurrency"
        :coordinates="DataStorePersisted.coordinates"
        :location_data="DataStorePersisted.getLocation"
        :search_mode="searchMode"
        :islogin="isLogin"
      />

      <q-space class="q-pa-lg"></q-space>

      <BrowseCuisine ref="browse_cuisine" :search_mode="searchMode">
      </BrowseCuisine>

      <component
        :is="AddressRecent"
        ref="ref_address"
        :map_provider="
          DataStore.maps_config ? DataStore.maps_config.provider : null
        "
        :recent_addresses="DataStorePersisted.recent_addresses"
        :is_login="userData ? true : false"
        @after-chooseaddress="afterChooseaddress"
        @after-chooselocation="afterChooselocation"
      ></component>
      <SearchAll v-if="searchMode == 'address'" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import {
  defineAsyncComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
} from "vue";
import APIinterface from "src/api/APIinterface";
import { useRouter } from "vue-router";
import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
import { usePlaceStore } from "stores/PlaceStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "src/stores/CartStore";
import { useClientStore } from "stores/ClientStore";
import { useMenuStore } from "stores/MenuStore";

export default {
  name: "HomePage",
  components: {
    HomeBanner: defineAsyncComponent(() => import("components/HomeBanner.vue")),
    CuisineCarousel: defineAsyncComponent(() =>
      import("components/CuisineCarousel.vue")
    ),
    BrowseCuisine: defineAsyncComponent(() =>
      import("components/BrowseCuisine.vue")
    ),

    FeaturedItems: defineAsyncComponent(() =>
      import("components/FeaturedItems.vue")
    ),
    TopButtons: defineAsyncComponent(() => import("components/TopButtons.vue")),
    FeedFilter: defineAsyncComponent(() => import("components/FeedFilter.vue")),
    FeedResults: defineAsyncComponent(() =>
      import("components/FeedResults.vue")
    ),
    InstallPwa: defineAsyncComponent(() => import("components/InstallPwa.vue")),
    SearchAll: defineAsyncComponent(() => import("components/SearchAll.vue")),
  },
  setup() {
    const transactionType = APIinterface.getStorage("transaction_type");
    const PlaceId = APIinterface.getStorage("place_id");
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const CartStore = useCartStore();
    const MenuStore = useMenuStore();
    const filters = ref({
      transaction_type: transactionType,
    });
    const topResto = ref("popular");
    const featuredTab = ref("all");
    const featured = ref([]);
    const q = ref("");
    const slide = ref(1);
    const cuisineList = ref([]);
    const selectedHomeCuisines = ref([]);
    const $router = useRouter();
    const hasResult = ref(true);
    const merchant_filter = ref(undefined);

    const merchantList = ref(null);
    const merchantRefCarousel = ref(null);
    const merchantRefCarousel2 = ref(null);
    const userData = ref([]);
    const isSticky = ref(false);
    const isScrolled = ref(false);

    const active_filers = ref(null);

    const DeliveryschedStore = useDeliveryschedStore();
    let observer = null;
    let lastScrollY = window.scrollY;
    let scrollListener = null;

    const searchMode = DataStore.getSearchMode;

    const AddressRecent = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    const MerchantCarousel = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/MerchantCarouselLocation.vue")
        : import("components/MerchantCarousel.vue")
    );

    onMounted(() => {
      scrollListener = () => {
        isScrolled.value = window.scrollY > 140;
      };
      window.addEventListener("scroll", scrollListener, { passive: true });
      scrollListener();

      if (auth.authenticated()) {
        userData.value = auth.getUser();
      } else {
        userData.value = false;
      }

      if (searchMode == "address") {
        active_filers.value = {
          coordinates: DataStorePersisted.coordinates,
          islogin: isLogin.value,
        };
      } else if (searchMode == "location") {
        active_filers.value = {
          location_data: DataStorePersisted.getLocation,
          islogin: isLogin.value,
        };
      }

      if (DataStore.homepage_filters) {
        if (
          JSON.stringify(active_filers.value) ==
          JSON.stringify(DataStore.homepage_filters)
        ) {
          console.log("home same filter");
        } else {
          console.log("home new filter");
          setTimeout(() => {
            merchantRefCarousel.value?.refreshData?.();
            merchantRefCarousel2.value?.refreshData?.();
            DataStore.featured_items = null;
            ref_featured_items.value.loadData();
          }, 500);
        }
      }

      // CLEAR PAGE FILTER
      DataStore.feed_page_filter = {};
      DataStore.clearPageFilter();

      console.log("DataStore.feed_filter", DataStore.feed_filter);
      if (Object.keys(DataStore.feed_filter).length <= 0) {
        DataStore.feed_filter = {
          list_type: "all",
          sort_by: DataStore.filter_sortby,
          enabled_review: DataStore.enabled_review,
          currency_code: DataStorePersisted.useCurrency,
          payload: [
            "cuisine",
            "reviews",
            "estimation",
            "services",
            "items_min_max",
            "offers",
            "promo",
          ],
        };
      }

      selectedHomeCuisines.value =
        DataStore.feed_filter?.filters?.cuisine?.map((id) => Number(id)) || [];

      const target = document.querySelector(".ref_sticky_target");
      setupObserver(target);
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
      if (scrollListener) {
        window.removeEventListener("scroll", scrollListener);
      }

      if (searchMode == "address") {
        DataStore.homepage_filters = {
          coordinates: DataStorePersisted.coordinates,
          islogin: isLogin.value,
        };
      } else if (searchMode == "location") {
        DataStore.homepage_filters = {
          location_data: DataStorePersisted.getLocation,
          islogin: isLogin.value,
        };
      }
    });

    const hasFilters = computed(() => {
      const filters = DataStore.feed_filter.filters;
      return (
        DataStore.feed_filter.sort_by ||
        filters?.cuisine?.length > 0 ||
        filters?.transaction_type ||
        filters?.offers_filters?.length > 0 ||
        filters?.price_range ||
        filters?.sortby ||
        filters?.quick_filters?.length > 0
      );
    });

    const hasSelectedCuisineFilter = computed(() => {
      const cuisine = DataStore.feed_filter.filters?.cuisine;
      return (
        selectedHomeCuisines.value.length > 0 ||
        (Array.isArray(cuisine) && cuisine.length > 0)
      );
    });

    const hasNonCuisineFilters = computed(() => {
      const filters = DataStore.feed_filter.filters;
      return (
        DataStore.feed_filter.sort_by ||
        filters?.transaction_type ||
        filters?.offers_filters?.length > 0 ||
        filters?.price_range ||
        filters?.sortby ||
        filters?.quick_filters?.length > 0
      );
    });

    const homeFilterCount = computed(() => {
      const filters = DataStore.feed_filter.filters || {};
      let count = 0;
      if (DataStore.feed_filter.sort_by) {
        count++;
      }
      if (filters.transaction_type) {
        count++;
      }
      if (filters.price_range) {
        count++;
      }
      if (filters.sortby) {
        count++;
      }
      if (filters.offers_filters?.length) {
        count += filters.offers_filters.length;
      }
      if (filters.quick_filters?.length) {
        count += filters.quick_filters.length;
      }
      return count;
    });

    const setupObserver = (target) => {
      observer = new IntersectionObserver(
        ([entry]) => {
          const isScrollingDown = window.scrollY > lastScrollY;

          if (!entry.isIntersecting && isScrollingDown) {
            // Set sticky when scrolling past the target
            isSticky.value = true;
          } else if (entry.isIntersecting) {
            // Reset sticky when the target comes back into view
            isSticky.value = false;
            if (hasFilters.value) {
              isSticky.value = true;
            }
          }

          lastScrollY = window.scrollY; // Update the last scroll position
        },
        {
          threshold: 0.5, // Fully in view
        }
      );

      if (target) {
        observer.observe(target);
      }
    };

    const onScroll = (info) => {
      isScrolled.value = info.position.top > 140;
    };

    const ref_feed_results = ref(null);
    const home_banner = ref(null);
    const ref_featured_items = ref(null);
    const ref_feed_filter = ref(null);

    const afterApplyfilter = (data) => {
      console.log("afterApplyfilter", data);
      DataStore.feed_filter.filters = data;
      DataStore.feed_filter.sort_by = data?.sort_by;
      selectedHomeCuisines.value = data?.cuisine?.map((id) => Number(id)) || [];
      ref_feed_results.value.resetData();
    };

    const filterUnmount = (data) => {
      console.log("filterUnmount", data);
      DataStore.filter_home = data;
    };

    const openHomeFilters = () => {
      if (ref_feed_filter.value) {
        ref_feed_filter.value.modal_filters = true;
      }
    };

    const openHomeSearch = () => {
      if (searchMode == "address") {
        DataStore.modal_search = true;
        return;
      }
      $router.push(getSearchLink.value || "/search");
    };

    const openHomeVoiceSearch = () => {
      DataStore.voice_search_requested = true;
      if (searchMode == "address") {
        DataStore.modal_search = true;
        return;
      }
      $router.push({
        path: getSearchLink.value || "/search",
        query: { voice: "1" },
      });
    };

    const afterGetdata = (data) => {
      cuisineList.value = data;
    };

    const getCuisineStickyTop = (panel) => {
      const top = parseFloat(getComputedStyle(panel).top);
      return Number.isNaN(top) ? 145 : top;
    };

    const scrollCuisinePanelToSticky = async () => {
      await nextTick();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const panel = document.querySelector(".tagam-home-cuisine-filter");
          if (!panel) {
            return;
          }
          const stickyTop = getCuisineStickyTop(panel);
          const rect = panel.getBoundingClientRect();
          const delta = rect.top - stickyTop;
          if (Math.abs(delta) < 3) {
            return;
          }
          window.scrollTo({
            top: Math.max(0, window.scrollY + delta + 1),
            behavior: "smooth",
          });
        });
      });
    };

    const afterCuisineSelect = (ids) => {
      const selectedIds = ids.map((id) => Number(id));
      selectedHomeCuisines.value = selectedIds;

      const currentFilters = {
        ...(DataStore.feed_filter?.filters || {}),
      };

      if (selectedIds.length > 0) {
        currentFilters.cuisine = selectedIds;
      } else {
        delete currentFilters.cuisine;
      }

      DataStore.feed_filter.filters = currentFilters;
      DataStore.filter_home = currentFilters;
      scrollCuisinePanelToSticky();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          ref_feed_results.value?.resetData?.();
        });
      });
    };

    const applyFilter = (data) => {
      hasResult.value = true;
      DataStore.filters = data;
    };

    const goSearch = () => {
      $router.push("/search");
    };

    const runFilter = () => {
      console.debug("runFilter");
    };

    const afterResults = (data) => {
      console.log("afterResults =>" + data);
      hasResult.value = data;
    };

    const filterAgain = () => {
      console.log("filterAgain");
      merchant_filter.value.filter = true;
    };

    const refresh = (done) => {
      const place_data = APIinterface.getStorage("place_data");
      DataStore.getBanner({
        latitude: place_data ? place_data.latitude : "",
        longitude: place_data ? place_data.longitude : "",
      });
      DataStore.CuisineList();

      DataStore.clearData();
      ref_feed_results.value?.resetData?.();

      merchantRefCarousel.value?.refreshData?.();
      merchantRefCarousel2.value?.refreshData?.();

      if (DataStore.chat_enabled && auth.authenticated()) {
        ClientStore.fetchNotification();
      }

      setTimeout(() => {
        done();
      }, 500);
    };

    const afterChooseaddress = (value, isWrite) => {
      console.log("afterChooseaddress", value);
      DataStorePersisted.recently_change_address = true;

      if (value.place_data) {
        MenuStore.cleanMerchantData();

        DataStorePersisted.place_data = value.place_data;
        DataStorePersisted.coordinates = value.location_coordinates;

        if (isWrite) {
          DataStorePersisted.saveRecentAddress(value.place_data);
        }

        DataStore.recommended_data = null;
        DataStore.featured_items = null;
        DataStore.banner = [];
        home_banner.value.loadData();
        ref_featured_items.value.loadData();

        setTimeout(() => {
          merchantRefCarousel.value?.refreshData?.();
          merchantRefCarousel2.value?.refreshData?.();

          DataStore.clearData();
          ref_feed_results.value.resetData();
        }, 500);
      }
    };

    const afterChooselocation = () => {
      console.log("afterChooselocation");
      DataStore.recommended_data = null;
      DataStore.banner = [];
      MenuStore.cleanMerchantData();

      home_banner.value?.loadData?.();

      setTimeout(async () => {
        DataStore.clearData();
        ref_feed_results.value?.resetData?.();
        merchantRefCarousel.value?.refreshData?.();
        merchantRefCarousel2.value?.refreshData?.();
        try {
          await CartStore.getCart(true, null);
        } catch (error) {}
      }, 500);
    };

    const isLogin = computed(
      () => DataStore.chat_enabled && auth.authenticated()
    );

    const getSearchLink = computed(() => {
      let link = null;
      if (searchMode == "location") {
        link = "/search/location";
      } else if (searchMode == "address") {
        link = "/search";
      }
      return link;
    });

    const homeLocationLabel = computed(() => {
      if (searchMode == "location") {
        return DataStorePersisted.getLocationAddress;
      }
      return DataStorePersisted.hasPlaceData
        ? DataStorePersisted.place_data.formatted_address
        : "";
    });

    return {
      getSearchLink,
      homeLocationLabel,
      isLogin,
      filters,
      topResto,
      q,
      slide,
      cuisineList,
      selectedHomeCuisines,
      afterGetdata,
      afterCuisineSelect,
      applyFilter,
      goSearch,
      runFilter,
      merchantList,
      merchantRefCarousel,
      merchantRefCarousel2,
      featuredTab,
      featured,
      afterResults,
      hasResult,
      DataStore,
      userData,
      filterAgain,
      merchant_filter,
      refresh,
      isSticky,
      //PlaceStore,
      onScroll,
      isScrolled,
      PlaceId,
      afterApplyfilter,
      ref_feed_results,
      ref_feed_filter,
      hasFilters,
      hasSelectedCuisineFilter,
      hasNonCuisineFilters,
      homeFilterCount,
      openHomeFilters,
      openHomeSearch,
      openHomeVoiceSearch,
      DataStorePersisted,
      afterChooseaddress,
      ClientStore,
      AddressRecent,
      searchMode,
      afterChooselocation,
      home_banner,
      MerchantCarousel,
      ref_featured_items,
      active_filers,
      filterUnmount,
    };
  },
};
</script>

<style lang="scss" scoped>
.tagam-home-page {
  --tagam-home-cuisine-sticky-top: 73px;
}

.tagam-home-tight-gap {
  height: 0;
}

.tagam-home-cuisine-heading {
  margin-top: 0;
  margin-bottom: 6px;
}

.tagam-home-cuisine-heading .tagam-section-title {
  font-size: 22px;
  line-height: 1.05;
}

.tagam-home-cuisine-heading .tagam-section-kicker {
  margin-bottom: 2px;
}
</style>



