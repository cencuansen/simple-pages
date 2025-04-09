<template>
  <div class="container">
    <div class="player-side">
      <video ref="videoPlayer" controls/>
      <div class="current-channel">
        <div>
          <span>当前频道: </span>
          <span v-if="selectedChannel">{{ selectedChannel.name }}</span>
          <span v-else>...</span>
        </div>
        <el-button @click="toggleDark()" size="small">
          <el-icon :size="16">
            <Sunny v-if="isDark"/>
            <Moon v-else/>
          </el-icon>
        </el-button>
      </div>
      <div class="more-info" v-if="selectedChannel">
        <div class="more-info-logo">
          <img :src="selectedChannel.logo" :alt="selectedChannel.name"/>
        </div>
        <div class="more-info-text">
          <div><span class="more-info-label">ID: </span>{{ selectedChannel.id }}</div>
          <div><span class="more-info-label">名称: </span>{{ selectedChannel.name }}</div>
          <div><span class="more-info-label">类别: </span>{{ selectedChannel.group.split(";").join("、") }}</div>
          <div><span class="more-info-label">地址: </span>{{ selectedChannel.url }}</div>
        </div>
      </div>
    </div>
    <div class="menu-side">
      <div class="controls">
        <el-input v-model="m3uUrl" placeholder="输入M3U地址" size="small" clearable/>
        <el-button type="primary" @click="loadPlaylist" size="small">导入</el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="列表" name="playlist"/>
        <el-tab-pane label="收藏" name="favorite"/>
        <el-tab-pane label="播放历史" name="play-history"/>
        <el-tab-pane label="导入历史" name="import-history"/>
      </el-tabs>
      <div class="list" v-loading="loading">
        <div v-show="activeTab === 'playlist'" class="tab-content">
          <el-input v-model="searchTerm" size="small" placeholder="搜索频道名称" class="search-box" clearable/>
          <el-collapse v-model="activeGroup" accordion @change="handleGroupChange">
            <el-collapse-item v-for="(group, groupName) in groupedChannels" :key="groupName" :name="groupName">
              <template #title>
                <span class="group-title">{{ groupName }} ({{ group.length }})</span>
              </template>
              <div class="channel-card" v-for="channel in paginatedGroupChannels(groupName)" :key="channel.url">
                <el-card
                    shadow="never"
                    :class="{ 'active-channel': currentChannel === channel.url }"
                    @click="playChannel(channel)"
                >
                  <div class="channel-content">
                    <div class="favorite" @click.stop="toggleFavorite(channel.id)">
                      <el-icon :size="20">
                        <StarFilled v-if="favoriteChannels.some(fc => fc.id === channel.id)" class="favorite-active"/>
                        <Star v-else/>
                      </el-icon>
                    </div>
                    <div class="channel-logo-div">
                      <img v-if="channel.logo" :src="channel.logo" alt="logo" class="channel-logo"
                           @error="handleImageError"/>
                    </div>
                    <div class="channel-name">
                      {{ channel.name }}
                    </div>
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
              />
            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-show="activeTab === 'favorite'" class="tab-content">
          <el-input v-model="favoriteSearchTerm" size="small" placeholder="搜索收藏频道" class="search-box" clearable/>
          <el-collapse v-model="activeFavoriteGroup" accordion @change="handleFavoriteGroupChange">
            <el-collapse-item v-for="(group, groupName) in groupedFavoriteChannels" :key="groupName" :name="groupName">
              <template #title>
                <span class="group-title">{{ groupName }} ({{ group.length }})</span>
              </template>
              <div class="channel-card" v-for="channel in paginatedFavoriteGroupChannels(groupName)" :key="channel.url">
                <el-card
                    shadow="never"
                    :class="{ 'active-channel': currentChannel === channel.url }"
                    @click="playChannel(channel)"
                >
                  <div class="channel-content">
                    <div class="favorite" @click.stop="toggleFavorite(channel.id)">
                      <el-icon :size="20">
                        <StarFilled class="favorite-active"/>
                      </el-icon>
                    </div>
                    <div class="channel-logo-div">
                      <img v-if="channel.logo" :src="channel.logo" alt="logo" class="channel-logo"
                           @error="handleImageError"/>
                    </div>
                    <div class="channel-name">
                      {{ channel.name }}
                    </div>
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
              />
            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-show="activeTab === 'play-history'" class="tab-content">
          <div class="channel-card" v-for="(channel, index) in playedHistory" :key="`${index}-${channel.url}`">
            <el-card
                shadow="never"
                :class="{ 'active-channel': currentChannel === channel.url }"
                @click="playChannel(channel)"
            >
              <div class="channel-content played-channel-item">
                <div class="favorite" @click.stop="toggleFavorite(channel.id)">
                  <el-icon :size="20">
                    <StarFilled v-if="favoriteChannels.some(fc => fc.id === channel.id)" class="favorite-active"/>
                    <Star v-else/>
                  </el-icon>
                </div>
                <div class="channel-logo-div">
                  <img v-if="channel.logo" :src="channel.logo" alt="logo" class="channel-logo"
                       @error="handleImageError"/>
                </div>
                <div class="channel-name">
                  {{ channel.name }}
                </div>
                <el-button class="delete-played-button" type="danger" size="small"
                           @click.stop="deletePlayedHistory(channel)">
                  删除
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
        <div v-show="activeTab === 'import-history'" class="tab-content">
          <div v-for="his in history" :key="his.url" class="history-item" @click="selectHistory(his.url)"
               :title="his.url">
            <span>{{ his.title || his.key || his.url }}</span>
            <el-button type="danger" size="small" @click.stop="deleteImportHistory(his)" v-if="!his.builtIn">删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Hls from 'hls.js';
import { ElMessage } from 'element-plus';
import { Star, StarFilled, Sunny, Moon } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const history = ref([
  {key: "built-in-index.m3u", title: "[内置] 不分类", builtIn: true, url: "https://iptv-org.github.io/iptv/index.m3u"},
  {
    key: "built-in-index.nsfw.m3u",
    title: "[内置] nsfw",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.nsfw.m3u"
  },
  {
    key: "built-in-index.category.m3u",
    title: "[内置] 按类别",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.category.m3u"
  },
  {
    key: "built-in-index.country.m3u",
    title: "[内置] 按国家",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.country.m3u"
  },
  {
    key: "built-in-index.language.m3u",
    title: "[内置] 按语言",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.language.m3u"
  },
  {
    key: "built-in-index.region.m3u",
    title: "[内置] 按地区",
    builtIn: true,
    url: "https://iptv-org.github.io/iptv/index.region.m3u"
  },
]);

const playedHistory = ref([]);

const loading = ref(false)
const m3uUrl = ref('');
const activeGroup = ref();
const activeTab = ref('playlist');
const channels = ref([]);
const searchTerm = ref('');
const favoriteChannels = ref([]);
const currentChannel = ref(null);
const selectedChannel = ref();
const videoPlayer = ref(null);
const itemsPerPage = ref(10);
const pagination = ref({});
const favoriteSearchTerm = ref('');
const activeFavoriteGroup = ref();
const favoritePagination = ref({});
const playedHistoryMaxLength = ref(20);
let hls = null;
let cachedGroupedChannels = null;
const m3uHistoryCacheKey = "m3u-history-channel";
const playedHistoryCacheKey = "played-history-channel";
const favoriteCacheKey = "favorite-channel";

const filteredChannels = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return channels.value.filter(channel => channel.name.toLowerCase().includes(term));
});

const groupedChannels = computed(() => {
  if (cachedGroupedChannels && searchTerm.value === '') {
    return cachedGroupedChannels;
  }
  const groups = {};
  filteredChannels.value.forEach(channel => {
    const groupNames = channel.group.split(';').filter(Boolean);
    groupNames.forEach(groupName => {
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(channel);
    });
  });
  if (searchTerm.value === '') {
    cachedGroupedChannels = groups;
  }
  return groups;
});

const filteredFavoriteChannels = computed(() => {
  const term = favoriteSearchTerm.value.toLowerCase();
  return favoriteChannels.value.filter(channel => channel.name.toLowerCase().includes(term));
});

const groupedFavoriteChannels = computed(() => {
  const groups = {};
  filteredFavoriteChannels.value.forEach(channel => {
    const groupNames = channel.group.split(';').filter(Boolean);
    groupNames.forEach(groupName => {
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(channel);
    });
  });
  return groups;
});

const paginatedGroupChannels = groupName => {
  const group = groupedChannels.value[groupName] || [];
  const page = pagination.value[groupName] || 1;
  const start = (page - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return group.sort((a, b) => a.name - b.name).slice(start, end);
};

const paginatedFavoriteGroupChannels = groupName => {
  const group = groupedFavoriteChannels.value[groupName] || [];
  const page = favoritePagination.value[groupName] || 1;
  const start = (page - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return group.sort((a, b) => a.name - b.name).slice(start, end);
};

const handleGroupChange = groupName => {
  if (groupName && !pagination.value[groupName]) {
    pagination.value[groupName] = 1;
  }
};

const handlePageChange = groupName => {
  pagination.value = {...pagination.value};
};

const handleFavoriteGroupChange = groupName => {
  if (groupName && !favoritePagination.value[groupName]) {
    favoritePagination.value[groupName] = 1;
  }
};

const handleFavoritePageChange = groupName => {
  favoritePagination.value = {...favoritePagination.value};
};

const toggleFavorite = id => {
  const channel = channels.value.find(c => c.id === id);
  if (!channel) return;
  if (favoriteChannels.value.find(c => c.id === id)) {
    favoriteChannels.value = favoriteChannels.value.filter(c => c.id !== id);
  } else {
    favoriteChannels.value.push(channel);
  }
  localStorage.setItem(favoriteCacheKey, JSON.stringify(favoriteChannels.value));
  favoritePagination.value = {...favoritePagination.value};
};

const saveToHistory = url => {
  if (!history.value.some(h => h.url === url)) {
    const urlParts = url.split('/');
    const name = urlParts[urlParts.length - 1];
    history.value.unshift({key: name, title: name, url});
    localStorage.setItem(m3uHistoryCacheKey, JSON.stringify(history.value));
  }
};

const saveToPlayedHistory = channel => {
  let index = -1;
  for (let i = 0; i < playedHistory.value.length; i++) {
    if (playedHistory.value[i].url === channel.url) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    playedHistory.value.splice(index, 1);
  }
  playedHistory.value.unshift(channel);
  if (playedHistory.value.length > playedHistoryMaxLength.value) {
    playedHistory.value = playedHistory.value.slice(0, playedHistoryMaxLength.value);
  }
  localStorage.setItem(playedHistoryCacheKey, JSON.stringify(playedHistory.value));
};

const selectHistory = url => {
  m3uUrl.value = url;
  loadPlaylist();
};

const deleteImportHistory = his => {
  if (his.builtIn) return;
  history.value = history.value.filter(h => h.url !== his.url);
  localStorage.setItem(m3uHistoryCacheKey, JSON.stringify(history.value));
};

const deletePlayedHistory = channel => {
  playedHistory.value = playedHistory.value.filter(h => h.url !== channel.url);
  localStorage.setItem(playedHistoryCacheKey, JSON.stringify(playedHistory.value));
};

const handleImageError = e => {
  e.target.style.display = 'none';
};

const parseM3U = async url => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    const parsedChannels = [];
    const urls = new Set();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXTINF')) {
        const extInfLine = lines[i];
        const urlLine = lines[i + 1]?.trim();

        if (!urlLine || urls.has(urlLine)) continue;

        const attributes = {};
        const attrMatches = extInfLine.match(/([a-zA-Z-]+)="([^"]+)"/g) || [];
        attrMatches.forEach(match => {
          const [key, value] = match.split('=');
          attributes[key] = value.replace(/"/g, '');
        });

        const nameParts = extInfLine.split(',');
        const name = nameParts[1]?.trim() || '未知频道';

        const channel = {
          name,
          url: urlLine,
          logo: attributes['tvg-logo'] || attributes['logo'] || '',
          group: attributes['group-title'] || attributes['group'] || '未分组',
          id: attributes['tvg-id'] || attributes['id'] || '',
          shift: attributes['tvg-shift'] || '',
          language: attributes['tvg-language'] || attributes['language'] || '',
        };

        if (channel.url) {
          parsedChannels.push(channel);
          urls.add(channel.url);
        }
      }
    }

    parsedChannels.sort((a, b) => {
      const groupCompare = a.group.localeCompare(b.group);
      if (groupCompare !== 0) return groupCompare;
      return a.name.localeCompare(b.name);
    });
    return parsedChannels;
  } catch (error) {
    console.error('解析M3U失败:', error);
    return [];
  }
};

const loadPlaylist = async () => {
  if (!m3uUrl.value) return;
  loading.value = true
  try {
    saveToHistory(m3uUrl.value);
    channels.value = await parseM3U(m3uUrl.value);
    pagination.value = {};
    cachedGroupedChannels = null;
    activeTab.value = 'playlist';
  } catch (error) {
    ElMessage.error('加载播放列表失败');
  } finally {
    loading.value = false
  }
};

const playChannel = channel => {
  currentChannel.value = channel.url;
  selectedChannel.value = channel;
  saveToPlayedHistory(channel);

  const video = videoPlayer.value;

  if (Hls.isSupported()) {
    if (hls) hls.destroy();
    hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
      loading.close();
    });
  } else {
    ElMessage.error('浏览器不支持播放此格式');
  }
};

onMounted(() => {
  history.value = JSON.parse(localStorage.getItem(m3uHistoryCacheKey)) || history.value;
  playedHistory.value = JSON.parse(localStorage.getItem(playedHistoryCacheKey)) || [];
  favoriteChannels.value = JSON.parse(localStorage.getItem(favoriteCacheKey)) || [];
});
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.player-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-side {
  width: 300px;
  padding: 5px;
  display: flex;
  flex-direction: column;
}

.controls {
  margin: 10px 0;
  display: flex;
  gap: 8px;
  user-select: none;
}

.player-side video {
  width: 100%;
  height: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.list {
  flex: 1;
  overflow: auto;
  height: 100%;
}

.list > * {
  padding-bottom: 50px;
}

.history-item {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: var(--el-border);
  justify-content: space-between;
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
  margin-right: 15px;
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
  width: 20px;
  height: 20px;
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
  background-color: #7fc0fa;
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
  padding: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.more-info {
  display: flex;
  padding: 30px;
}

.more-info-logo {
  width: 100px;
  height: 100px;
  user-select: none;
  margin-right: 10px;
  border: 1px solid #ccc;
}

.more-info-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.more-info-label {
  user-select: none;
}

/* 移动端适配 */
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
    max-height: 50vh;
  }

  .menu-side {
    width: 100%;
    padding: 10px;
    max-height: 55vh;
  }

  .controls {
    margin: 0;
  }

  .tab-content {
    padding-bottom: 100px;
    overflow-y: auto;
  }

  .current-channel {
    padding: 8px;
    font-size: 12px;
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
}

@media (max-width: 650px) {
  .menu-side {
    max-height: 58vh;
  }
}

@media (max-width: 600px) {
  /* 断点4 */
  .menu-side {
    max-height: 61vh; /* +3vh */
  }
}

@media (max-width: 550px) {
  /* 断点5 */
  .menu-side {
    max-height: 65vh; /* +3vh（达到目标值） */
  }
}

@media (max-width: 500px) {
  .menu-side {
    max-height: 68vh;
  }
}

</style>