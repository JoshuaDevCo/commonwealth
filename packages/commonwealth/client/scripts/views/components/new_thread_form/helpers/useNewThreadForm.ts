import { useState } from 'react';
import type { DeltaStatic } from 'quill';

import type { Topic } from 'models';
import { ThreadKind } from 'models';

const useNewThreadForm = (authorName: string, hasTopics: boolean) => {
  const [threadKind, setThreadKind] = useState<ThreadKind>(
    ThreadKind.Discussion
  );
  const [threadTitle, setThreadTitle] = useState('');
  const [threadTopic, setThreadTopic] = useState<Topic>(null);
  const [threadUrl, setThreadUrl] = useState('');
  const [threadContentDelta, setThreadContentDelta] = useState<DeltaStatic>();
  const [isSaving, setIsSaving] = useState(false);

  const hasOnlyNewLineCharacter = /^\s+$/.test(
    threadContentDelta?.ops?.[0]?.insert
  );

  const isDiscussion = threadKind === ThreadKind.Discussion;
  const disableSave = !authorName || isSaving;
  const topicMissing = hasTopics && !threadTopic;
  const titleMissing = !threadTitle;
  const linkContentMissing = !isDiscussion && !threadUrl;
  const contentMissing = !threadContentDelta || hasOnlyNewLineCharacter;

  const isDisabled =
    disableSave ||
    titleMissing ||
    topicMissing ||
    linkContentMissing ||
    contentMissing;

  return {
    threadKind,
    setThreadKind,
    threadTitle,
    setThreadTitle,
    threadTopic,
    setThreadTopic,
    threadUrl,
    setThreadUrl,
    threadContentDelta,
    setThreadContentDelta,
    isSaving,
    setIsSaving,
    isDisabled,
  };
};

export default useNewThreadForm;