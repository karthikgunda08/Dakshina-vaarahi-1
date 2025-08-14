// src/features/tools/CommentsTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, AppComment, Reply, ProjectData } from '../../types/index';
import { resolveDesignCommentApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

export const CommentsTool: React.FC<PhoenixEnginePanelProps> = (props) => {
  const { currentUser, levels, activeLevelIndex, setSingleLevelProp, pushToUndoStack, focusedCommentId, setFocusedCommentId, setBuyCreditsModalOpen, refreshCurrentUser, aiFixPreview, setAiFixPreview, currentProject, applySamaranganFix } = props;
  
  const activeLevel = levels[activeLevelIndex];
  if (!activeLevel) return null;

  const comments = activeLevel.comments || [];
  const setComments = (updater: React.SetStateAction<AppComment[]>) => setSingleLevelProp('comments', updater);

  const [replyText, setReplyText] = useState('');
  const [loadingFix, setLoadingFix] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const activeComment = comments?.find(c => c.id === focusedCommentId);

  const handleResolveToggle = (commentId: string) => {
    pushToUndoStack();
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c));
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeComment || !currentUser) return;
    
    pushToUndoStack();
    const newReply: Reply = {
      id: generateId('reply'),
      userId: currentUser.id,
      userName: currentUser.name || currentUser.email,
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments(prev => prev.map(c => c.id === activeComment.id ? { ...c, replies: [...(c.replies || []), newReply] } : c));
    setReplyText('');
  };
  
  const handleAskAIToFix = async (comment: AppComment) => {
    if (!currentUser) { addNotification("Please log in.", "error"); return; }
    if (currentUser.role !== 'owner' && currentUser.credits < 5) {
      addNotification(`You need 5 credits.`, 'info');
      setBuyCreditsModalOpen(true);
      return;
    }
    setLoadingFix(comment.id);
    try {
        const projectData: ProjectData = { name: props.currentProject?.name || 'Untitled Project', projectType: props.currentProject?.projectType || 'building', levels: props.levels, planNorthDirection: props.planNorthDirection, propertyLines: props.propertyLines, terrainMesh: props.terrainMesh, zones: [], infrastructure: [] };
        const fixResponse = await resolveDesignCommentApi(currentProject?.id || '', comment.text, projectData, { x: comment.x, y: comment.y });
        setAiFixPreview({ commentId: comment.id, fix: fixResponse.fix });
        addNotification("AI has proposed a fix! Preview it on the canvas.", "success");
        await refreshCurrentUser();
    } catch (err: any) {
        addNotification(`AI Fix failed: ${err.message}`, 'error');
    } finally {
        setLoadingFix(null);
    }
  };

  const handleApplyFix = () => {
    if (!aiFixPreview) return;
    applySamaranganFix(aiFixPreview.fix);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {comments?.length === 0 && <p className="text-center text-slate-400 p-4">No comments on this level yet. Use the comment tool to add feedback.</p>}
        <ul className="space-y-2">
          {comments?.map(comment => (
            <li key={comment.id} onClick={() => setFocusedCommentId(comment.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${focusedCommentId === comment.id ? 'bg-slate-700' : 'bg-slate-900/50 hover:bg-slate-700/50'}`}>
              <div className="flex justify-between items-start">
                  <div>
                      <p className={`text-sm ${comment.resolved ? 'line-through text-slate-500' : 'text-slate-200'}`}>{comment.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{comment.userName} - {new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleResolveToggle(comment.id); }} className={`p-1 rounded-full ${comment.resolved ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeComment && (
        <div className="flex-shrink-0 p-3 border-t border-slate-700 bg-slate-800">
            <h4 className="text-base font-semibold text-sky-300 mb-2">Thread for: "{activeComment.text}"</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-2 pr-2">
                {(activeComment.replies || []).map(reply => (
                    <div key={reply.id} className="bg-slate-700 p-2 rounded-md">
                        <p className="text-sm text-slate-300">{reply.text}</p>
                        <p className="text-xs text-slate-500 text-right mt-1">{reply.userName}</p>
                    </div>
                ))}
            </div>
             {aiFixPreview && aiFixPreview.commentId === activeComment.id && (
                <div className="my-2 p-3 bg-purple-900/50 border border-purple-600 rounded-lg text-center">
                    <p className="text-sm text-purple-200 mb-2">💡 AI has proposed a fix. Preview the changes on the 2D canvas.</p>
                    <div className="flex gap-2">
                         <button onClick={handleApplyFix} className="flex-1 p-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md">Apply Fix</button>
                         <button onClick={() => setAiFixPreview(null)} className="flex-1 p-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-md">Discard</button>
                    </div>
                </div>
            )}
            <button
                onClick={() => handleAskAIToFix(activeComment)}
                disabled={loadingFix === activeComment.id || !!aiFixPreview}
                className="w-full text-sm p-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center disabled:bg-sky-800"
            >
                {loadingFix === activeComment.id ? <LoadingSpinner size="h-4 w-4 mr-2" /> : '💡'} Ask AI to Fix (5 Cr)
            </button>
            <form onSubmit={handleAddReply} className="flex gap-2 mt-2">
                <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Add a reply..." className="flex-grow p-2 text-sm bg-slate-700 border border-slate-600 rounded-md" />
                <button type="submit" className="px-4 bg-slate-600 rounded-md">Send</button>
            </form>
        </div>
      )}
    </div>
  );
};
