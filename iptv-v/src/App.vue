<template>
  <div class="container">
    <div class="player-side">
      <video
          ref="videoPlayer"
          controls
          @volumechange="videoVolumeChange"
          aria-label="Video player"
      />
      <div class="current-channel">
        <el-text
            class="current-channel-name"
            :type="loadingFailed ? 'danger' : 'success'"
            truncated
        >
          {{ selectedChannel?.name || 'No channel selected' }}
        </el-text>
        <div class="current-channel-status">
          <el-text
              v-if="loadingFailed"
              class="loading-failed-detail"
              type="danger"
              truncated
          >
            {{ playErrorDetail }}
          </el-text>
          <el-button
              :disabled="!selectedChannel"
              @click="playChannel(selectedChannel)"
              size="small"
              aria-label="Refresh channel"
          >
            <el-icon :size="12">
              <Refresh/>
            </el-icon>
          </el-button>
        </div>
      </div>
      <div v-if="selectedChannel" class="more-info">
        <div class="more-info-logo">
          <img
              :src="selectedChannel.logo"
              :alt="`Logo for ${selectedChannel.name}`"
              @error="handleImageError"
          />
        </div>
        <el-form class="more-info-text" label-width="50px">
          <el-form-item v-if="selectedChannel.id" label="ID">
            <span>{{ selectedChannel.id }}</span>
          </el-form-item>
          <el-form-item label="名称">
            <span>{{ selectedChannel.name }}</span>
          </el-form-item>
          <el-form-item v-if="selectedChannel.group" label="类别">
            <span>{{ selectedChannel.group.split(";").join("、") }}</span>
          </el-form-item>
          <el-form-item label="列表">
            <span
                class="more-info-url"
                @click="copyText(selectedChannel.url)"
                role="button"
                tabindex="0"
                @keydown.enter="copyText(selectedChannel.url)"
            >
              {{ shortString(selectedChannel?.url, 45) }}
            </span>
          </el-form-item>
          <el-form-item v-if="selectedChannel.realUrl" label="源">
            <span
                class="more-info-url"
                @click="copyText(selectedChannel.realUrl)"
                role="button"
                tabindex="0"
                @keydown.enter="copyText(selectedChannel.realUrl)"
            >
              {{ shortString(selectedChannel.realUrl, 45) }}
            </span>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="menu-side">
      <el-tabs v-model="activeTab" type="border-card" v-loading="loading">
        <el-tab-pane
            label="列表"
            name="playlist"
            class="list"
            aria-label="Channel playlist"
        >
          <el-input
              v-model="searchTerm"
              size="small"
              placeholder="搜索频道名称"
              class="search-box"
              clearable
              @input="debouncedSearch"
              aria-label="Search channels"
          />
          <el-collapse
              v-model="activeGroup"
              accordion
              @change="handleGroupChange"
          >
            <el-collapse-item
                v-for="(group, groupName) in groupedChannels"
                :key="groupName"
                :name="groupName"
            >
              <template #title>
                <span class="group-title" :title="groupName">
                  {{ shortString(groupName, 25) }} ({{ group.length }})
                </span>
              </template>
              <div
                  class="channel-card"
                  v-for="channel in paginatedGroupChannels(groupName)"
                  :key="channel.url"
              >
                <el-card
                    shadow="never"
                    :class="{ 'active-channel': selectedChannel?.url === channel.url }"
                    @click="playChannel(channel)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="playChannel(channel)"
                >
                  <div class="channel-content">
                    <div
                        class="favorite"
                        @click.stop="toggleFavorite(channel)"
                        role="button"
                        tabindex="0"
                        @keydown.enter.stop="toggleFavorite(channel)"
                        :aria-label="`Toggle favorite for ${channel.name}`"
                    >
                      <el-icon :size="15">
                        <StarFilled
                            v-if="favoriteChannels.some(fc => fc.id === channel.id)"
                            class="favorite-active"
                        />
                        <Star v-else/>
                      </el-icon>
                    </div>
                    <div class="channel-logo-div">
                      <img
                          v-if="channel.logo"
                          :src="channel.logo"
                          :alt="`Logo for ${channel.name}`"
                          class="channel-logo"
                          loading="lazy"
                          @error="handleImageError"
                      />
                    </div>
                    <el-text
                        class="channel-name"
                        :type="channelNameColorType(channel)"
                        truncated
                    >
                      {{ channel.name }}
                    </el-text>
                  </div>
                </el-card>
              </div>
              <el-pagination
                  v-if="group.length > itemsPerPage"
                  v-model:current-page="pagination[groupName]"
                  :page-size="itemsPerPage"
                  :total="group.length"
                  layout="prev, pager, next"
                  class="pagination"
                  @current-change="() => handlePageChange(groupName)"
                  aria-label="Channel pagination"
              />
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane
            label="播放"
            name="play-history"
            class="list"
            aria-label="Play history"
        >
          <div
              class="channel-card"
              v-for="(channel, index) in playedHistory"
              :key="`${index}-${channel.url}`"
          >
            <el-card
                shadow="never"
                :class="{ 'active-channel': selectedChannel?.url === channel.url }"
                @click="playChannel(channel)"
                role="button"
                tabindex="0"
                @keydown.enter="playChannel(channel)"
            >
              <div class="channel-content played-channel-item">
                <div
                    class="favorite"
                    @click.stop="toggleFavorite(channel)"
                    role="button"
                    tabindex="0"
                    @keydown.enter.stop="toggleFavorite(channel)"
                    :aria-label="`Toggle favorite for ${channel.name}`"
                >
                  <el-icon :size="20">
                    <StarFilled
                        v-if="favoriteChannels.some(fc => fc.id === channel.id)"
                        class="favorite-active"
                    />
                    <Star v-else/>
                  </el-icon>
                </div>
                <div class="channel-logo-div">
                  <img
                      v-if="channel.logo"
                      :src="channel.logo"
                      :alt="`Logo for ${channel.name}`"
                      class="channel-logo"
                      loading="lazy"
                      @error="handleImageError"
                  />
                </div>
                <el-text
                    class="channel-name"
                    :type="channelNameColorType(channel)"
                    truncated
                >
                  {{ channel.name }}
                </el-text>
                <el-button
                    class="delete-played-button"
                    type="danger"
                    size="small"
                    @click.stop="deletePlayedHistory(channel)"
                    aria-label="Delete from play history"
                >
                  删除
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane
            label="导入"
            name="import-history"
            class="import-history list"
        >
          <el-radio-group v-model="importMode" size="small" class="import-mode">
            <el-radio label="m3u" aria-label="Import M3U playlist">M3U播放列表</el-radio>
            <el-radio label="single" aria-label="Import single channel">单个频道</el-radio>
          </el-radio-group>
          <el-form
              v-if="importMode === 'single'"
              :model="singleChannelForm"
              label-width="80px"
              class="single-channel-form"
          >
            <el-form-item label="频道地址" prop="url" required>
              <el-input
                  v-model="singleChannelForm.url"
                  placeholder="输入频道URL（如.m3u8）"
                  size="small"
                  clearable
                  aria-label="Channel URL"
              />
            </el-form-item>
            <el-form-item label="频道名称" prop="name">
              <el-input
                  v-model="singleChannelForm.name"
                  placeholder="输入频道名称（可选）"
                  size="small"
                  clearable
                  aria-label="Channel name"
              />
            </el-form-item>
            <el-form-item label="分组" prop="group">
              <el-input
                  v-model="singleChannelForm.group"
                  placeholder="输入分组（可选，多个用;分隔）"
                  size="small"
                  clearable
                  aria-label="Channel group"
              />
            </el-form-item>
            <el-form-item label="Logo" prop="logo">
              <el-input
                  v-model="singleChannelForm.logo"
                  placeholder="输入Logo URL（可选）"
                  size="small"
                  clearable
                  aria-label="Channel logo URL"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                  type="primary"
                  size="small"
                  @click="importSingleChannel"
                  :disabled="!singleChannelForm.url"
                  aria-label="Import single channel"
              >
                导入
              </el-button>
            </el-form-item>
          </el-form>
          <el-input
              v-else
              v-model="m3uUrl"
              placeholder="输入M3U播放列表地址"
              size="small"
              clearable
              aria-label="Import M3U URL"
          >
            <template #append>
              <el-button
                  size="small"
                  type="info"
                  @click="loadPlaylist(m3uUrl)"
                  :disabled="!m3uUrl"
                  aria-label="Import playlist"
              >
                导入
              </el-button>
            </template>
          </el-input>
          <div
              v-for="his in history"
              :key="his.url"
              class="history-item"
              @click="loadPlaylist(his.url)"
              :title="his.url"
              role="button"
              tabindex="0"
              @keydown.enter="loadPlaylist(his.url)"
          >
            <span>{{ shortString(his.title || his.key || his.url, 20) }}</span>
            <div class="history-button">
              <el-button
                  v-if="!his.builtIn"
                  class="history-button-item delete-button"
                  type="danger"
                  size="small"
                  @click.stop="deleteImportHistory(his)"
                  aria-label="Delete import history"
              >
                删除
              </el-button>
              <el-button
                  class="history-button-item copy-button"
                  type="primary"
                  size="small"
                  @click.stop="copyText(his.url)"
                  aria-label="Copy URL"
              >
                复制
              </el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane
            label="收藏"
            name="favorite"
            class="list"
            aria-label="Favorite channels"
        >
          <el-input
              v-model="favoriteSearchTerm"
              size="small"
              placeholder="搜索收藏频道"
              class="search-box"
              clearable
              @input="debouncedFavoriteSearch"
              aria-label="Search favorite channels"
          />
          <el-collapse
              v-model="activeFavoriteGroup"
              accordion
              @change="handleFavoriteGroupChange"
          >
            <el-collapse-item
                v-for="(group, groupName) in groupedFavoriteChannels"
                :key="groupName"
                :name="groupName"
            >
              <template #title>
                <span class="group-title">
                  {{ groupName }} ({{ group.length }})
                </span>
              </template>
              <div
                  class="channel-card"
                  v-for="channel in paginatedFavoriteGroupChannels(groupName)"
                  :key="channel.url"
              >
                <el-card
                    shadow="never"
                    :class="{ 'active-channel': selectedChannel?.url === channel.url }"
                    @click="playChannel(channel)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="playChannel(channel)"
                >
                  <div class="channel-content">
                    <div
                        class="favorite"
                        @click.stop="toggleFavorite(channel)"
                        role="button"
                        tabindex="0"
                        @keydown.enter.stop="toggleFavorite(channel)"
                        :aria-label="`Toggle favorite for ${channel.name}`"
                    >
                      <el-icon :size="20">
                        <StarFilled class="favorite-active"/>
                      </el-icon>
                    </div>
                    allee
                    <div class="channel-logo-div">
                      <img
                          v-if="channel.logo"
                          :src="channel.logo"
                          :alt="`Logo for ${channel.name}`"
                          class="channel-logo"
                          loading="lazy"
                          @error="handleImageError"
                      />
                    </div>
                    <el-text
                        class="channel-name"
                        :type="playedFailed.find(f => f.url === channel.url) ? 'danger' : 'info'"
                        truncated
                    >
                      {{ channel.name }}
                    </el-text>
                  </div>
                </el-card>
              </div>
              <el-pagination
                  v-if="group.length > itemsPerPage"
                  v-model:current-page="favoritePagination[groupName]"
                  :page-size="itemsPerPage"
                  :total="group.length"
                  layout="prev, pager, next"
                  class="pagination"
                  @current-change="() => handleFavoritePageChange(groupName)"
                  aria-label="Favorite channel pagination"
              />
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane
            label="配置"
            name="setting"
            class="list setting"
            aria-label="Settings"
        >
          <el-form label-width="50px">
            <el-form-item label="主题" prop="darkMode">
              <el-switch
                  v-model="darkMode"
                  inline-prompt
                  :active-icon="Moon"
                  :inactive-icon="Sunny"
                  aria-label="Toggle dark mode"
              />
            </el-form-item>
            <el-form-item label="缓存">
              <el-button
                  @click="clearCache"
                  type="danger"
                  size="small"
                  aria-label="Clear cache"
              >
                清空
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import Hls from "hls.js";
import {ElMessage} from "element-plus";
import {
  Star,
  StarFilled,
  Sunny,
  Moon,
  Refresh,
} from "@element-plus/icons-vue";
import {useDark, useToggle} from "@vueuse/core";
import {debounce} from "lodash-es";

// Constants
const STORAGE_KEYS = {
  IMPORT_HISTORY: "import-history",
  PLAY_HISTORY: "play-history",
  FAIL_HISTORY: "fail-history",
  FAVORITE: "favorite",
  VIDEO_VOLUME: "video-volume",
} as const;

const CONFIG = {
  ITEMS_PER_PAGE: 10,
  PLAYED_HISTORY_MAX_LENGTH: 20,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// Types
interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  realUrl?: string;
  shift?: string;
  language?: string;
}

interface HistoryItem {
  key: string;
  title?: string;
  url: string;
  builtIn?: boolean;
  isSingleChannel?: boolean;
}

interface SingleChannelForm {
  url: string;
  name: string;
  group: string;
  logo: string;
}

// Reactive State
const isDark = useDark();
const toggleDark = useToggle(isDark);
const darkMode = computed({
  get: () => isDark.value,
  set: (val) => toggleDark(val),
});

const history = ref<HistoryItem[]>([
  {
    key: "built-in-index.m3u",
    title: "[内置] 不分类",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.m3u",
  },
  {
    key: "built-in-index.category.m3u",
    title: "[内置] 按类别",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.category.m3u",
  },
  {
    key: "built-in-index.country.m3u",
    title: "[内置] 按国家",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.country.m3u",
  },
  {
    key: "built-in-index.language.m3u",
    title: "[内置] 按语言",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.language.m3u",
  },
  {
    key: "built-in-index.region.m3u",
    title: "[内置] 按地区",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.region.m3u",
  },
]);

const playedHistory = ref<Channel[]>([]);
const playedFailed = ref<Channel[]>([]);
const loading = ref(false);
const loadingFailed = ref(false);
const m3uUrl = ref("");
const importMode = ref<"m3u" | "single">("m3u");
const singleChannelForm = ref<SingleChannelForm>({
  url: "",
  name: "",
  group: "",
  logo: "",
});
const activeGroup = ref<string | undefined>();
const activeTab = ref("playlist");
const channels = ref<Channel[]>([]);
const searchTerm = ref("");
const favoriteChannels = ref<Channel[]>([]);
const selectedChannel = ref<Channel | undefined>();
const videoPlayer = ref<HTMLVideoElement | null>(null);
const videoVolume = ref(1);
const itemsPerPage = ref(CONFIG.ITEMS_PER_PAGE);
const pagination = ref<Record<string, number>>({});
const favoriteSearchTerm = ref("");
const activeFavoriteGroup = ref<string | undefined>();
const favoritePagination = ref<Record<string, number>>({});
const playErrorDetail = ref("");
let hls: Hls | null = null;
let cachedGroupedChannels: Record<string, Channel[]> | null = null;

// Computed Properties
const filteredChannels = computed(() =>
    channels.value.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
);

const groupedChannels = computed(() => {
  if (cachedGroupedChannels && searchTerm.value === "") {
    return cachedGroupedChannels;
  }
  const groups: Record<string, Channel[]> = {};
  filteredChannels.value.forEach((channel) => {
    const groupNames = (channel.group || "未分组")
        .split(";")
        .filter(Boolean);
    groupNames.forEach((groupName) => {
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(channel);
    });
  });
  if (searchTerm.value === "") {
    cachedGroupedChannels = groups;
  }
  return groups;
});

const filteredFavoriteChannels = computed(() =>
    favoriteChannels.value.filter((channel) =>
        channel.name.toLowerCase().includes(favoriteSearchTerm.value.toLowerCase())
    )
);

const groupedFavoriteChannels = computed(() => {
  const groups: Record<string, Channel[]> = {};
  filteredFavoriteChannels.value.forEach((channel) => {
    const groupNames = (channel.group || "未分组")
        .split(";")
        .filter(Boolean);
    groupNames.forEach((groupName) => {
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(channel);
    });
  });
  return groups;
});

// Methods
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success("已复制");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const videoVolumeChange = debounce((ev: Event) => {
  const target = ev.target as HTMLVideoElement;
  videoVolume.value = target.volume;
  localStorage.setItem(STORAGE_KEYS.VIDEO_VOLUME, String(videoVolume.value));
}, 1000);

const clearCache = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  history.value = history.value.filter((h) => h.builtIn);
  playedHistory.value = [];
  playedFailed.value = [];
  favoriteChannels.value = [];
  videoVolume.value = 1;
  ElMessage.success("缓存已清空");
};

const channelNameColorType = (channel: Channel): string => {
  if (
      selectedChannel.value?.url === channel.url &&
      !loadingFailed.value
  ) {
    return "success";
  }
  if (playedFailed.value.some((f) => f.url === channel.url)) {
    return "danger";
  }
  return "info";
};

const paginatedGroupChannels = (groupName: string) => {
  const group = groupedChannels.value[groupName] || [];
  const page = pagination.value[groupName] || 1;
  const start = (page - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return group.sort((a, b) => a.name.localeCompare(b.name)).slice(start, end);
};

const paginatedFavoriteGroupChannels = (groupName: string) => {
  const group = groupedFavoriteChannels.value[groupName] || [];
  const page = favoritePagination.value[groupName] || 1;
  const start = (page - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return group.sort((a, b) => a.name.localeCompare(b.name)).slice(start, end);
};

const handleGroupChange = (groupName?: string) => {
  if (groupName && !pagination.value[groupName]) {
    pagination.value[groupName] = 1;
  }
};

const handlePageChange = (groupName: string) => {
  pagination.value = {...pagination.value};
};

const handleFavoriteGroupChange = (groupName?: string) => {
  if (groupName && !favoritePagination.value[groupName]) {
    favoritePagination.value[groupName] = 1;
  }
};

const handleFavoritePageChange = (groupName: string) => {
  favoritePagination.value = {...favoritePagination.value};
};

const toggleFavorite = (channel: Channel) => {
  if (!channel.url) return;
  const index = favoriteChannels.value.findIndex(
      (c) => c.url === channel.url
  );
  if (index >= 0) {
    favoriteChannels.value.splice(index, 1);
  } else {
    favoriteChannels.value.unshift(channel);
  }
  localStorage.setItem(
      STORAGE_KEYS.FAVORITE,
      JSON.stringify(favoriteChannels.value)
  );
  favoritePagination.value = {...favoritePagination.value};
};

const shortString = (str: string, maxLength = 20) => {
  if (!str) return "";
  return str.length > maxLength
      ? `${str.substring(0, maxLength)}...`
      : str;
};

const addImportHistory = (url: string, isSingleChannel = false, title?: string) => {
  if (!history.value.some((h) => h.url === url)) {
    const urlParts = url.split("/");
    const name = title || urlParts[urlParts.length - 1] || (isSingleChannel ? "单个频道" : "未知列表");
    const key = isSingleChannel ? `single-${Date.now()}` : name;
    history.value.unshift({key, title: name, url, isSingleChannel});
    localStorage.setItem(
        STORAGE_KEYS.IMPORT_HISTORY,
        JSON.stringify(history.value)
    );
  }
};

const addPlayHistory = (channel: Channel) => {
  const index = playedHistory.value.findIndex(
      (h) => h.url === channel.url
  );
  if (index >= 0) {
    playedHistory.value.splice(index, 1);
  }
  playedHistory.value.unshift(channel);
  if (playedHistory.value.length > CONFIG.PLAYED_HISTORY_MAX_LENGTH) {
    playedHistory.value = playedHistory.value.slice(
        0,
        CONFIG.PLAYED_HISTORY_MAX_LENGTH
    );
  }
  localStorage.setItem(
      STORAGE_KEYS.PLAY_HISTORY,
      JSON.stringify(playedHistory.value)
  );
};

const addFailedHistory = (channel: Channel) => {
  if (playedFailed.value.some((f) => f.url === channel.url)) return;
  playedFailed.value.unshift(channel);
  localStorage.setItem(
      STORAGE_KEYS.FAIL_HISTORY,
      JSON.stringify(playedFailed.value)
  );
};

const deleteFailedHistory = (channel: Channel) => {
  playedFailed.value = playedFailed.value.filter(
      (f) => f.url !== channel.url
  );
  localStorage.setItem(
      STORAGE_KEYS.FAIL_HISTORY,
      JSON.stringify(playedFailed.value)
  );
};

const deleteImportHistory = (his: HistoryItem) => {
  if (his.builtIn) return;
  history.value = history.value.filter((h) => h.url !== his.url);
  localStorage.setItem(
      STORAGE_KEYS.IMPORT_HISTORY,
      JSON.stringify(history.value)
  );
};

const deletePlayedHistory = (channel: Channel) => {
  playedHistory.value = playedHistory.value.filter(
      (h) => h.url !== channel.url
  );
  localStorage.setItem(
      STORAGE_KEYS.PLAY_HISTORY,
      JSON.stringify(playedHistory.value)
  );
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = "none";
};

const parseM3U = async (url: string): Promise<Channel[]> => {
  try {
    const response = await fetch(url, {mode: "cors"});
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const text = await response.text();
    const lines = text.split("\n").map((line) => line.trim());
    const parsedChannels: Channel[] = [];
    const urls = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith("#EXTINF")) continue;

      const extInfLine = lines[i];
      const urlLine = lines[i + 1]?.trim();

      if (!urlLine || urls.has(urlLine)) continue;

      const attributes: Record<string, string> = {};
      const attrMatches = extInfLine.match(/([a-zA-Z-]+)="([^"]+)"/g) || [];
      attrMatches.forEach((match) => {
        const [key, value] = match.split("=");
        attributes[key] = value.replace(/"/g, "");
      });

      const nameParts = extInfLine.split(",");
      const name = nameParts[nameParts.length - 1]?.trim() || "未知频道";

      const channel: Channel = {
        name,
        url: urlLine,
        logo: attributes["tvg-logo"] || attributes["logo"] || "",
        group: attributes["group-title"] || attributes["group"] || "未分组",
        id: attributes["tvg-id"] || attributes["id"] || "",
        shift: attributes["tvg-shift"] || "",
        language: attributes["tvg-language"] || attributes["language"] || "",
      };

      if (channel.url) {
        parsedChannels.push(channel);
        urls.add(channel.url);
      }
    }

    return parsedChannels.sort((a, b) => {
      const groupCompare = a.group.localeCompare(b.group);
      return groupCompare !== 0
          ? groupCompare
          : a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("解析M3U失败:", error);
    ElMessage.error("无法加载播放列表");
    return [];
  }
};

const validateUrl = (url: string): boolean => {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url);
};

const importSingleChannel = async () => {
  const {url, name, group, logo} = singleChannelForm.value;
  if (!validateUrl(url)) {
    ElMessage.error("请输入有效的频道URL");
    return;
  }

  loading.value = true;
  try {
    // Optional: Verify URL accessibility
    const response = await fetch(url, {method: "HEAD", mode: "cors"});
    if (!response.ok) {
      throw new Error("频道URL不可访问");
    }

    const channel: Channel = {
      id: `single-${Date.now()}`,
      name: name || `频道-${new Date().toLocaleString()}`,
      url,
      logo: logo || "",
      group: group || "未分组",
      shift: "",
      language: "",
    };

    channels.value.unshift(channel);
    addImportHistory(url, true, channel.name);
    pagination.value = {};
    cachedGroupedChannels = null;
    activeTab.value = "playlist";
    singleChannelForm.value = {url: "", name: "", group: "", logo: ""};
    ElMessage.success("频道导入成功");
  } catch (error) {
    console.error("导入单个频道失败:", error);
    ElMessage.error("导入频道失败，请检查URL");
  } finally {
    loading.value = false;
  }
};

const loadPlaylist = async (url: string) => {
  if (!url || !validateUrl(url)) {
    ElMessage.error("请输入有效的地址");
    return;
  }
  loading.value = true;
  try {
    const isSingleChannel = history.value.find((h) => h.url === url)?.isSingleChannel;
    if (isSingleChannel) {
      const existingChannel = channels.value.find((c) => c.url === url);
      if (existingChannel) {
        channels.value = [existingChannel, ...channels.value.filter((c) => c.url !== url)];
      } else {
        const channel: Channel = {
          id: `single-${Date.now()}`,
          name: history.value.find((h) => h.url === url)?.title || "未知频道",
          url,
          logo: "",
          group: "未分组",
          shift: "",
          language: "",
        };
        channels.value.unshift(channel);
      }
    } else {
      const parsedChannels = await parseM3U(url);
      if (parsedChannels.length === 0) {
        throw new Error("播放列表为空");
      }
      addImportHistory(url);
      channels.value = parsedChannels;
    }
    pagination.value = {};
    cachedGroupedChannels = null;
    activeTab.value = "playlist";
  } catch (error) {
    console.error("加载失败:", error);
    ElMessage.error("加载失败，请检查地址");
  } finally {
    loading.value = false;
    m3uUrl.value = "";
  }
};

const playChannel = (channel: Channel | undefined) => {
  if (!channel) return;

  selectedChannel.value = channel;
  loadingFailed.value = false;
  playErrorDetail.value = "";
  addPlayHistory(channel);

  const video = videoPlayer.value;
  if (!video) return;

  const handleError = (ev: string, data: any) => {
    loadingFailed.value = true;
    playErrorDetail.value =
        data.details || "播放失败，请检查网络或尝试其他频道";
    addFailedHistory(channel);

    video.pause();
    video.removeAttribute("src");
    video.load();
    if (hls) {
      hls.destroy();
      hls = null;
    }
  };

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, (ev, data) => {
      selectedChannel.value = {
        ...selectedChannel.value!,
        realUrl: data.levels[0].url[0],
      };
      deleteFailedHistory(channel);
      video.volume = videoVolume.value;
      video.play().catch(() => {
        ElMessage.warning("播放失败，请稍后再试");
      });
    });
    hls.on(Hls.Events.INTERSTITIAL_ASSET_ERROR, handleError);
    hls.on(Hls.Events.ERROR, handleError);
  } else {
    ElMessage.error("浏览器不支持HLS播放");
  }
};

const debouncedSearch = debounce(() => {
  cachedGroupedChannels = null;
}, CONFIG.SEARCH_DEBOUNCE_MS);

const debouncedFavoriteSearch = debounce(() => {
}, CONFIG.SEARCH_DEBOUNCE_MS);

// Lifecycle
onMounted(() => {
  history.value =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_HISTORY)) ||
      history.value;
  playedHistory.value =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAY_HISTORY)) || [];
  playedFailed.value =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.FAIL_HISTORY)) || [];
  favoriteChannels.value =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE)) || [];
  videoVolume.value =
      Number(localStorage.getItem(STORAGE_KEYS.VIDEO_VOLUME)) || 1;
});
</script>

<style scoped>
:root {
  --active-bg-color: #f0f0f0;
  --border-color: #dcdcdc;
}

.container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.player-side {
  flex: 1;
  display: flex;
  width: calc(100vw - 300px);
  height: 100vh;
  flex-direction: column;
}

.menu-side {
  width: 300px;
  padding: 0 5px;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs) {
  height: 100%;
}

:deep(.el-tabs__content) {
  overflow-y: scroll;
  padding-bottom: 110px;
}

.list {
  overflow-y: hidden;
}

.loading-failed-detail {
  margin-right: 10px;
}

.player-side video {
  height: 70vh;
  object-fit: contain;
  background-color: #000;
}

.history-item {
  position: relative;
  display: flex;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}

.history-button {
  position: absolute;
  right: 0;
}

.history-button .delete-button {
  margin-left: 5px;
}

.search-box {
  margin-bottom: 12px;
}

.channel-card:hover,
.el-card:hover,
.channel-content:hover {
  transition: none;
}

.el-card {
  border: none;
  cursor: pointer;
}

:deep(.el-card__body) {
  padding: 5px;
}

.channel-content {
  display: flex;
  align-items: center;
  user-select: none;
}

.channel-content > * {
  margin-right: 5px;
}

.channel-content > *:last-child {
  margin-right: 0;
}

.played-channel-item {
  position: relative;
}

.delete-played-button {
  position: absolute;
  right: 0;
}

.favorite {
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-active {
  color: red;
}

.channel-logo-div {
  width: 15px;
  height: 15px;
}

.channel-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.channel-name {
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-channel {
  background-color: var(--active-bg-color);
}

.group-title {
  font-weight: bold;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.current-channel {
  padding: 5px 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-text {
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.current-channel-status {
  display: flex;
  align-items: center;
}

.more-info {
  display: flex;
  padding: 5px;
}

.more-info-text .el-form-item {
  margin-bottom: 0;
  height: 24px;
}

.more-info-url {
  cursor: pointer;
  color: #409eff;
}

.more-info-logo {
  width: 100px;
  height: 100px;
  user-select: none;
  margin-right: 10px;
  border: 1px solid var(--border-color);
}

.more-info-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.import-mode {
  margin-bottom: 12px;
}

.import-history .el-form-item {
  height: 24px;
}

.single-channel-form {
  margin-bottom: 12px;
}

@media (max-width: 750px) {
  .container {
    flex-direction: column;
    height: auto;
  }

  .player-side {
    width: 100%;
    order: -1;
  }

  .player-side video {
    height: 35vh;
  }

  .loading-failed-detail {
    display: none;
  }

  .menu-side {
    width: 100%;
    height: 60vh;
  }

  .more-info {
    display: none;
  }

  .search-box {
    margin-bottom: 8px;
  }

  .group-title {
    font-size: 14px;
  }

  .channel-card {
    margin-bottom: 5px;
  }

  .channel-content {
    font-size: 12px;
  }

  .channel-logo-div {
    width: 16px;
    height: 16px;
  }

  .el-button {
    padding: 8px;
  }

  .favorite {
    padding: 5px;
  }

  .pagination {
    padding: 5px 0;
  }

  :deep(.el-pagination .el-pager li) {
    min-width: 20px;
    font-size: 12px;
  }

  .import-mode {
    margin-bottom: 8px;
  }

  .single-channel-form .el-form-item {
    margin-bottom: 8px;
  }
}
</style>