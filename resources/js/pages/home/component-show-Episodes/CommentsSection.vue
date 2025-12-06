<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AlignLeft, Smile } from 'lucide-vue-next';
import { router } from '@inertiajs/vue3';
import CommentItem from './CommentItem.vue';

const props = defineProps<{
  comments: any[];
  authUser: any;
  episodeId: number;
}>();

const newComment = ref('');
const showMainEmojiPicker = ref(false);
const isMainInputFocused = ref(false);
const mainEmojiContainer = ref<HTMLElement | null>(null);

const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'];

const toggleMainEmojiPicker = () => showMainEmojiPicker.value = !showMainEmojiPicker.value;
const addMainEmoji = (emoji: string) => newComment.value += emoji;

const handleClickOutside = (event: MouseEvent) => {
  if (showMainEmojiPicker.value && mainEmojiContainer.value && !mainEmojiContainer.value.contains(event.target as Node)) {
    showMainEmojiPicker.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('avatars/')) return `/storage/${avatar}`;
  return `/storage/avatars/${avatar}`;
};

const addComment = () => {
    if (!newComment.value.trim()) return;

    router.post(`/episodes/${props.episodeId}/comments`, {
        content: newComment.value
    }, {
        preserveScroll: true,
        onSuccess: () => {
            newComment.value = '';
            isMainInputFocused.value = false;
        }
    });
};
</script>

<template>
  <div class="mt- flex flex-col bg-white dark:bg-[#1f1f1f] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#333] shadow-sm p-6">
      <div class="flex items-center justify-between mb-8">
           <h3 class="text-xl font-bold text-[#0f0f0f] dark:text-[#f1f1f1]">{{ comments.length }} تعليق</h3>
           <button class="flex items-center gap-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-gray-100 dark:hover:bg-[#272727] px-4 py-2 rounded-full transition">
               <AlignLeft class="w-5 h-5" />
               <span>الترتيب حسب</span>
           </button>
      </div>

      <!-- Add Comment Input -->
      <div class="flex gap-4 mb-8">
           <div class="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-purple-600 rounded-full select-none shadow-md">
                <img 
                  v-if="authUser?.avatar" 
                  :src="getAvatarUrl(authUser.avatar)" 
                  :alt="authUser.name" 
                  class="object-cover w-full h-full"
                />
                <span 
                  v-else 
                  class="text-lg font-bold text-white"
                >
                  {{ authUser?.name?.charAt(0) || 'U' }}
                </span>
           </div>
           <div class="flex-1">
               <div class="relative group">
                   <textarea 
                      v-model="newComment"
                      @focus="isMainInputFocused = true"
                      placeholder="إضافة تعليق..." 
                      class="w-full bg-gray-50 dark:bg-[#272727] border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1f1f1f] focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3 px-4 text-sm text-[#0f0f0f] dark:text-[#f1f1f1] placeholder-gray-500 resize-none outline-none transition-all duration-200 min-h-[50px]"
                      rows="1"
                   ></textarea>
                   <div class="absolute bottom-2 left-2 flex items-center gap-2">
                       <div class="relative" ref="mainEmojiContainer">
                           <button @click="toggleMainEmojiPicker" class="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#333] transition text-gray-500 dark:text-[#aaa] hover:text-[#0f0f0f] dark:hover:text-white">
                               <Smile class="w-5 h-5" />
                           </button>
                           <!-- Emoji Picker -->
                           <div v-if="showMainEmojiPicker" class="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333] w-[320px] p-3">
                               <div class="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                   <button v-for="emoji in emojis" :key="emoji" @click="addMainEmoji(emoji)" class="text-xl p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition">{{ emoji }}</button>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
               <div v-if="isMainInputFocused || newComment" class="flex items-center justify-end gap-3 mt-3 animate-in fade-in slide-in-from-top-2">
                   <button @click="isMainInputFocused = false; newComment = ''" class="px-4 py-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full transition">إلغاء</button>
                   <button @click="addComment" :disabled="!newComment" :class="['px-5 py-2 text-sm font-bold rounded-full transition shadow-sm', newComment ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5' : 'bg-gray-200 dark:bg-[#272727] text-gray-500 cursor-not-allowed']">تعليق</button>
               </div>
           </div>
      </div>

      <!-- Comments List -->
      <div class="space-y-6">
          <CommentItem 
            v-for="comment in comments" 
            :key="comment.id" 
            :comment="comment" 
          />
      </div>
  </div>
</template>
