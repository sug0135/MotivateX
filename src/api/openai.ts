import axios from 'axios';
import { OPENAI_API_KEY } from '@env';
import { firestore } from '../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';  // Firebase v9のFirestore操作に必要


const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});


// 正規表現で「原因は」の後のテキストを抽出する関数
const extractProcrastinationCause = (responseText: string): string => {
  const match = responseText.match(/原因は(.*?)[。|、|\n]/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '原因が見つかりませんでした';
};





export const sendMessageToChatGPT = async (message: string, userId: string) => {
  try {
    const systemMessage = {
      role: 'system',
      content: 'あなたはカウンセラーです。ユーザーが物事を先送りにしている原因を特定し、それを簡潔に教えてください。',
    };

    const userMessage = {
      role: 'user',
      content: message,
    };


    const response = await api.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, userMessage],
    },{
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const chatGPTResponse = response.data.choices[0].message.content;


    const extractedCause = extractProcrastinationCause(chatGPTResponse);


    const saveCauseToFirestore = async (userId: string, cause: string) => {
      try {
        await addDoc(collection(firestore, 'procrastination_causes'), {
          userId,
          cause,
          timestamp: serverTimestamp(),
        });
        console.log('Cause saved to Firestore');
      } catch (error) {
        console.error('Error saving cause to Firestore:', error);
      }
    };

    await saveCauseToFirestore(userId, chatGPTResponse);


    return extractedCause;
  } catch (error) {
    console.error('Error communicating with ChatGPT or Firestore:', error);
    throw new Error('Failed to process the request.');
  }
};

