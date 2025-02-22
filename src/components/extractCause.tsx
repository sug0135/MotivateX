// /src/utils/extractCause.ts
export const extractProcrastinationCause = (responseText: string): string => {
    // 「原因は」で始まる文章を探して抽出
    const match = responseText.match(/原因は(.*?)[。|、|\n]/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return '原因が特定できませんでした。';
  };
  