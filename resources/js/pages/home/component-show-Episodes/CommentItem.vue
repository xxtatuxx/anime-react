<script setup lang="ts">
import { ref, computed } from 'vue';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Smile, MoreVertical, Edit2, Trash2, CornerDownRight } from 'lucide-vue-next';
import { router, usePage } from '@inertiajs/vue3';

const props = defineProps<{
  comment: any;
  depth?: number;
}>();

const page = usePage();
const authUser = computed(() => page.props.auth.user);

const depth = props.depth || 0;
const isExpanded = ref(false);
const isReplying = ref(false);
const isEditing = ref(false);
const replyText = ref('');
const editText = ref(props.comment.content);
const showEmojiPicker = ref(false);
const emojiContainer = ref<HTMLElement | null>(null);

const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'];

const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('avatars/')) return `/storage/${avatar}`;
  return `/storage/avatars/${avatar}`;
};

const toggleLike = (isLike: boolean) => {
    // Optimistic Update
    const previousState = props.comment.user_interaction;
    const previousLikes = props.comment.likes;
    const previousDislikes = props.comment.dislikes;

    if (props.comment.user_interaction === isLike) {
        // Removing interaction
        props.comment.user_interaction = null;
        if (isLike) props.comment.likes--;
        else props.comment.dislikes--;
    } else {
        // Changing or adding interaction
        if (props.comment.user_interaction === true) props.comment.likes--;
        if (props.comment.user_interaction === false) props.comment.dislikes--;
        
        props.comment.user_interaction = isLike;
        if (isLike) props.comment.likes++;
        else props.comment.dislikes++;
    }

    router.post(`/comments/${props.comment.id}/like`, { is_like: isLike }, {
        preserveScroll: true,
        onError: () => {
            // Revert
            props.comment.user_interaction = previousState;
            props.comment.likes = previousLikes;
            props.comment.dislikes = previousDislikes;
        }
    });
};

const submitReply = () => {
    if (!replyText.value.trim()) return;

    router.post(`/episodes/${page.props.episode.id}/comments`, {
        content: replyText.value,
        parent_id: props.comment.id
    }, {
        preserveScroll: true,
        onSuccess: () => {
            replyText.value = '';
            isReplying.value = false;
            isExpanded.value = true; // Expand to show new reply
        }
    });
};

const submitEdit = () => {
    if (!editText.value.trim()) return;

    router.put(`/comments/${props.comment.id}`, {
        content: editText.value
    }, {
        preserveScroll: true,
        onSuccess: () => {
            isEditing.value = false;
        }
    });
};

const deleteComment = () => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    router.delete(`/comments/${props.comment.id}`, {
        preserveScroll: true,
    });
};

const toggleEmojiPicker = () => showEmojiPicker.value = !showEmojiPicker.value;
const addEmoji = (emoji: string) => {
    if (isEditing.value) editText.value += emoji;
    else replyText.value += emoji;
};

// Close emoji picker on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (showEmojiPicker.value && emojiContainer.value && !emojiContainer.value.contains(event.target as Node)) {
    showEmojiPicker.value = false;
  }
};

// Register/Unregister click listener
import { onMounted, onUnmounted } from 'vue';
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

</script>

<template>
    <div class="group relative" :class="{ 'mr-4 md:mr-8 border-r-2 border-gray-100 dark:border-[#333] pr-4': depth > 0 }">
        <div class="flex gap-3">
            <!-- Avatar -->
            <div class="flex-shrink-0">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-[#272727] shadow-sm">
                    <img 
                        v-if="comment.user_avatar" 
                        :src="getAvatarUrl(comment.user_avatar)" 
                        :alt="comment.user" 
                        class="object-cover w-full h-full"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                        {{ comment.user.charAt(0).toUpperCase() }}
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <!-- Header -->
                <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:text-blue-500 cursor-pointer transition">
                            {{ comment.user }}
                        </span>
                        <span class="text-xs text-gray-500">{{ comment.date }}</span>
                    </div>
                    
                    <!-- Actions Dropdown (Edit/Delete) -->
                    <div v-if="authUser && authUser.id === comment.user_id" class="relative group/menu">
                        <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition">
                            <MoreVertical class="w-4 h-4" />
                        </button>
                        <div class="absolute left-0 top-full mt-1 w-32 bg-white dark:bg-[#1f1f1f] rounded-lg shadow-xl border border-gray-100 dark:border-[#333] py-1 hidden group-hover/menu:block z-10">
                            <button @click="isEditing = true" class="w-full text-right px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#272727] flex items-center gap-2">
                                <Edit2 class="w-3 h-3" /> تعديل
                            </button>
                            <button @click="deleteComment" class="w-full text-right px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                                <Trash2 class="w-3 h-3" /> حذف
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Text Content -->
                <div v-if="!isEditing">
                    <p class="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] leading-6 whitespace-pre-wrap">{{ comment.content }}</p>
                </div>

                <!-- Edit Form -->
                <div v-else class="mt-2">
                    <div class="relative">
                        <textarea 
                            v-model="editText" 
                            class="w-full bg-gray-50 dark:bg-[#272727] border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1f1f1f] rounded-xl py-2 px-3 text-sm text-[#0f0f0f] dark:text-[#f1f1f1] resize-none outline-none min-h-[60px]"
                            rows="2"
                        ></textarea>
                         <!-- Emoji Button for Edit -->
                         <div class="absolute bottom-2 left-2" ref="emojiContainer">
                            <button @click="toggleEmojiPicker" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333] transition text-gray-500">
                                <Smile class="w-4 h-4" />
                            </button>
                             <div v-if="showEmojiPicker" class="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl border border-gray-200 dark:border-[#333] w-[250px] p-2">
                                <div class="grid grid-cols-8 gap-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                                    <button v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" class="text-lg p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition">{{ emoji }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-end gap-2 mt-2">
                        <button @click="isEditing = false" class="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full transition">إلغاء</button>
                        <button @click="submitEdit" class="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-full transition shadow-sm">حفظ</button>
                    </div>
                </div>

                <!-- Actions Bar -->
                <div class="flex items-center gap-4 mt-2">
                    <!-- Like -->
                    <button @click="toggleLike(true)" :class="['flex items-center gap-1.5 transition group/btn', comment.user_interaction === true ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-[#aaa] hover:text-blue-600 dark:hover:text-blue-500']">
                        <ThumbsUp class="w-4 h-4 group-hover/btn:scale-110 transition-transform" :fill="comment.user_interaction === true ? 'currentColor' : 'none'" />
                        <span class="text-xs font-bold">{{ comment.likes }}</span>
                    </button>
                    
                    <!-- Dislike -->
                    <button @click="toggleLike(false)" :class="['flex items-center gap-1.5 transition group/btn', comment.user_interaction === false ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-[#aaa] hover:text-red-600 dark:hover:text-red-500']">
                        <ThumbsDown class="w-4 h-4 group-hover/btn:scale-110 transition-transform" :fill="comment.user_interaction === false ? 'currentColor' : 'none'" />
                        <span class="text-xs font-bold">{{ comment.dislikes }}</span>
                    </button>

                    <!-- Reply Button -->
                    <button @click="isReplying = !isReplying" class="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#272727] px-2 py-1 rounded-full transition">
                        <CornerDownRight class="w-3.5 h-3.5" /> رد
                    </button>
                </div>

                <!-- Reply Form -->
                <div v-if="isReplying" class="mt-3 animate-in fade-in slide-in-from-top-2">
                    <div class="flex gap-3">
                         <div class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                             {{ authUser?.name?.charAt(0) || 'U' }}
                         </div>
                         <div class="flex-1">
                             <div class="relative">
                                <textarea 
                                    v-model="replyText" 
                                    placeholder="اكتب ردك هنا..." 
                                    class="w-full bg-gray-50 dark:bg-[#272727] border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1f1f1f] rounded-xl py-2 px-3 text-sm text-[#0f0f0f] dark:text-[#f1f1f1] resize-none outline-none min-h-[50px]"
                                    rows="1"
                                    autoFocus
                                ></textarea>
                                <!-- Emoji Button for Reply -->
                                <div class="absolute bottom-2 left-2" ref="emojiContainer">
                                    <button @click="toggleEmojiPicker" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333] transition text-gray-500">
                                        <Smile class="w-4 h-4" />
                                    </button>
                                     <div v-if="showEmojiPicker" class="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl border border-gray-200 dark:border-[#333] w-[250px] p-2">
                                        <div class="grid grid-cols-8 gap-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                                            <button v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" class="text-lg p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition">{{ emoji }}</button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             <div class="flex items-center justify-end gap-2 mt-2">
                                <button @click="isReplying = false" class="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full transition">إلغاء</button>
                                <button @click="submitReply" :disabled="!replyText" :class="['px-3 py-1.5 text-xs font-bold rounded-full transition shadow-sm', replyText ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-[#272727] text-gray-500 cursor-not-allowed']">رد</button>
                             </div>
                         </div>
                    </div>
                </div>

                <!-- Nested Replies (Recursive) -->
                <div v-if="comment.children && comment.children.length > 0" class="mt-3">
                    <button @click="isExpanded = !isExpanded" class="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-full transition w-fit mb-2">
                        <component :is="isExpanded ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
                        <span>{{ isExpanded ? 'إخفاء الردود' : `عرض ${comment.children.length} ردود` }}</span>
                    </button>
                    
                    <div v-if="isExpanded" class="space-y-4">
                        <CommentItem 
                            v-for="child in comment.children" 
                            :key="child.id" 
                            :comment="child" 
                            :depth="depth + 1" 
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
