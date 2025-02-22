import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  StyleSheet, 
  Keyboard, 
  ImageBackground, 
  TouchableWithoutFeedback, 
  Alert 
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [taskToDeleteIndex, setTaskToDeleteIndex] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null); // 修正: 状態を宣言
  const [selectedMajorReason, setSelectedMajorReason] = useState<number | null>(null);
  const [selectedMinorReasons, setSelectedMinorReasons] = useState<string[]>([]);
  const [selectedReasonsMap, setSelectedReasonsMap] = useState<Record<number, number[]>>({});
  const [helpModalVisible, setHelpModalVisible] = useState(false); // ヘルプモーダルの状態追加

  const [selectedMinorReasonsMap, setSelectedMinorReasonsMap] = useState<
  Record<number, string[]>
>({});


type Task = {
  task: string;
  count: number; // 小要因合計数
  majorReason: number | null;
  minorReasons: string[]; // number[]ではなく、string[] に変更
  minorReasonsMap: Record<number, string[]>; // 各大要因ごとの小要因保存用
};


  // 大要因の定義
  const majorReasons = ['感情', 'やり方', '環境'];

  // const minorReasonsMap: Record<number, string[]> = {
  //   0: Array(4).fill('自信がない'), // 完璧主義
  //   1: Array(4).fill('恥ずかしい'), // 失敗への恐怖
  //   2: Array(2).fill('不安'),       // 無気力
  // };


    // 小要因を選択中の大要因に基づいて取得
  // const getMinorReasons = (majorReasonIndex: number | null) : string[] => {
  //     return majorReasonIndex !== null ? minorReasonsMap[majorReasonIndex] : [];
  //   };

  const getMinorReasons = (majorReasonIndex: number | null) : string[] => {
    if (majorReasonIndex === null || initialMinorReasonsMap[majorReasonIndex] === undefined) {
      return [];
    }
    return initialMinorReasonsMap[majorReasonIndex].map((item) => item.reason);
  };
  

  // const getMinorReasons = (majorReasonIndex: number | null): MinorReason[] => {
  //   return majorReasonIndex !== null && initialMinorReasonsMap[majorReasonIndex]
  //     ? initialMinorReasonsMap[majorReasonIndex]
  //     : [];
  // };
  


  type MinorReason = {
    reason: string;
    selected: 0 | 1; // 0: 非表示, 1: 表示
  };

  const initialMinorReasonsMap: Record<number, MinorReason[]> = {
      0: [
        { reason: '完璧主義', selected: 0 },
        { reason: '自信の欠如', selected: 0 },
        { reason: '退屈・面倒', selected: 0 },
      ],
      1: [
        { reason: '進め方がわからない', selected: 0 },
        { reason: '成果が見えない', selected: 0 },
        { reason: '継続できない', selected: 0 },
        { reason: '忘れやすい', selected: 0 },
      ],
      2: [
        { reason: '邪魔が入る', selected: 0 },
        { reason: '集中できない', selected: 0 },
      ],
    };
//--------------------------------------------------------------------------------------------------------------------------


  // ゴミ箱アイコン押下時に削除確認モーダル
  const handleDeleteRequest = (index: number) => {
    setTaskToDeleteIndex(index);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDeleteIndex !== null) {
      const updated = [...tasks];
      updated.splice(taskToDeleteIndex, 1);
      setTasks(updated);
      saveTasksToStorage(updated);
    }
    setDeleteConfirmVisible(false);
    setTaskToDeleteIndex(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setTaskToDeleteIndex(null);
  };

  // タスクをタップ → 大要因・小要因設定用モーダル表示
  const handleTaskPress = (index: number) => {
    const task = tasks[index];
    setSelectedTask(task.task);
    setSelectedTaskIndex(index);
    setSelectedMajorReason(task.majorReason);
    setSelectedMinorReasons(task.minorReasons);
    setSelectedMinorReasonsMap({ ...task.minorReasonsMap }); // ← 開いた時点でコピー
    setModalVisible(true);
  };

  // モーダルを閉じるときに現在の選択状態を反映して保存
  const handleCloseModal = () => {
    if (selectedTaskIndex !== null) {
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
  
        // ① すべての大要因の小要因を集める
        const allMinorReasons = Object.values(selectedMinorReasonsMap).flat();
  
        // ② 小要因の合計数を数える
        const totalSelectedMinorReasonsCount = allMinorReasons.length;
  
        // ③ タスクデータを更新
        updatedTasks[selectedTaskIndex] = {
          ...updatedTasks[selectedTaskIndex],
          count: totalSelectedMinorReasonsCount,
          majorReason: selectedMajorReason, // ← 最後に選択していた大要因の記録（必要ならそのまま）
          minorReasons: allMinorReasons,    // ← ★ ここが重要！全大要因の小要因をまとめてセット！
          minorReasonsMap: selectedMinorReasonsMap, // ← これはそのまま保持でOK
        };
  
        // 保存
        saveTasksToStorage(updatedTasks);
  
        return updatedTasks;
      });
    }
    setModalVisible(false);
    resetModalState();
  };
  

const toggleHelpModal = () => {
  setHelpModalVisible(!helpModalVisible);
};

const resetModalState = () => {
  // setSelectedMajorReason(null);
  // setSelectedMinorReasons([]);
  setSelectedReasonsMap({});
};

   // 大要因選択時の処理
   const handleMajorReasonSelect = (index: number) => {
    // 現在の大要因の小要因選択状態を保存する
  // if (selectedMajorReason !== null) {
  //   setSelectedMinorReasonsMap((prevMap) => ({
  //     ...prevMap,
  //     [selectedMajorReason]: selectedMinorReasons,
  //   }));
  // }
  if (selectedMajorReason !== index) {
    setSelectedMajorReason(index);
    setSelectedMinorReasons(selectedMinorReasonsMap[index] || []);
  }
 };




  // 小要因のトグル処理
  const toggleMinorReason = (reason: string) => {
    const updatedMinorReasons = selectedMinorReasons.includes(reason)
    ? selectedMinorReasons.filter((item) => item !== reason)
    : [...selectedMinorReasons, reason];

    // if (selectedMinorReasons.includes(reason)) {
    //   setSelectedMinorReasons(selectedMinorReasons.filter((item) => item !== reason));
    // } else {
    //   setSelectedMinorReasons([...selectedMinorReasons, reason]);
    // }

    setSelectedMinorReasons(updatedMinorReasons);

    if (selectedMajorReason !== null) {
      setSelectedMinorReasonsMap((prevMap) => ({
        ...prevMap,
        [selectedMajorReason]: updatedMinorReasons,
      }));
    }
  };

  // AsyncStorageへ保存
  const saveTasksToStorage = async (data: typeof tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleAddTask2 = () => {
    const trimmedTask = newTask.trim();
    if (trimmedTask) {
      const updatedTasks = [{
        task: trimmedTask,
        count: 0,
        majorReason: null,
        minorReasons: [],
        minorReasonsMap: {
          0: [],
          1: [],
          2: [],
        },
      },
      ...tasks,
      ];
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks); // 保存処理を追加
      setNewTask('');
      Alert.alert('新規追加', `'${trimmedTask}' を追加しました`);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      const json = await AsyncStorage.getItem('tasks');
      if (json) {
        setTasks(JSON.parse(json));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ImageBackground
        source={require('../../../assets/profilebackground.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
        <View style={styles.borderContainer}>
          <View>
            <Text style={styles.headerText}>STEP 1.  要因分析</Text>
            <TouchableOpacity onPress={toggleHelpModal}>
              <View style={styles.helpButton}>
                <Text style={styles.helpIcon}>?</Text>
              </View>
            </TouchableOpacity>
          </View>
          
  
            {/* 新規タスク追加 */}
            <View style={styles.newTaskContainer}>
            <TextInput
              style={styles.input}
              placeholder="先延ばしを新規追加"
              value={newTask}
              onChangeText={setNewTask}
            />
              <TouchableOpacity onPress={handleAddTask2} style={styles.addButton}>
          
              <FontAwesome name="plus" size={14} color="white" />
            </TouchableOpacity>
            </View>
        

            <FlatList
              data={tasks}
              renderItem={({ item, index }) => (
                <View style={styles.taskItem}>
                  {/* タスクの名前とカウント */} 
                  <TouchableOpacity onPress={() => handleTaskPress(index)} style={{ flex: 1 }}>
                    <View style={styles.taskWithBadge}>
                      <Text style={styles.taskText}>{item.task}</Text>
                      {item.count > 0 && ( // カウントが1以上の場合のみ表示
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.count}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {/* ゴミ箱アイコン */}
                  <TouchableOpacity onPress={() => handleDeleteRequest(index)}>
                    <FontAwesome name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            //   keyExtractor={(item, index) => index.toString()}
            // />
            keyExtractor={(item, index) => `${index}-${item.task}`} // 一意のキーを設定
            />

          </View>

          <Modal
            transparent={true}
            visible={helpModalVisible}
            animationType="fade"
            onRequestClose={toggleHelpModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.helpModalContent}>
                <Text style={styles.helpText}>
                {'① 新規追加をすると\nリストに反映されます\n\n'}
                {'② 追加した要素をタップすると\n要因が選択できます'}
 
                </Text>
                <TouchableOpacity onPress={toggleHelpModal} style={styles.closeHelpButton}>
                  <Text style={styles.closeHelpButtonText}>閉じる</Text>
                </TouchableOpacity>
                
              </View>
            </View>
          </Modal>


              {/* モーダル */}
              <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={handleCloseModal}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{selectedTask || '選択されたタスク'}</Text>
                    
                    {/* 大要因 */}
                    <Text style={styles.sectionTitle}>1. 大要因</Text>
                    <View style={styles.majorReasonContainer}>
                      {majorReasons.map((reason, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.majorReasonItem,
                              selectedMajorReason === index && { backgroundColor: 'white' },
                            ]}
                            onPress={() => handleMajorReasonSelect(index)}
                          >
                            <Text
                              style={[
                                styles.reasonText,
                                selectedMajorReason === index && { color: '#046576', borderColor: '#046576' },
                              ]}
                            >
                              {reason}
                            </Text>
                            {/* {selectedMajorReason === index && selectedMinorReasons.length > 0 && (
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>{selectedMinorReasons.length}</Text>
                              </View>
                            )} */}
                            {selectedMinorReasonsMap[index]?.length > 0 && (
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>{selectedMinorReasonsMap[index].length}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                      ))}
                    </View>
      
                    {/* 小要因 */}
                    <Text style={styles.sectionTitle}>2. 小要因</Text>
                    <View style={styles.minorReasonContainer}>
                      {/* {minorReasons.map((reason, index) => ( */}
                      {getMinorReasons(selectedMajorReason).map((reason: string, index: number) => (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.minorReasonItem,
                            selectedMinorReasons.includes(reason) && styles.selectedReason,
                          ]}
                          onPress={() => toggleMinorReason(reason)}
                        >
                          <Text
                            style={[
                              styles.reasonText,
                              selectedMinorReasons.includes(reason) && styles.selectedReasonText,
                            ]}
                          >
                            {reason}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
      
                    <TouchableOpacity
                    onPress={handleCloseModal}
                      // onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>閉じる</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
  
              {/* 削除確認モーダル */}
              <Modal
                transparent={true}
                visible={deleteConfirmVisible}
                animationType="slide"
                onRequestClose={handleDeleteCancel}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.deleteModal}>
                    <Text style={styles.modalText}>本当に削除しますか？</Text>
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteConfirm}
                      >
                        <Text style={styles.deleteButtonText}>削除する</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleDeleteCancel}
                      >
                        <Text style={styles.cancelButtonText}>キャンセル</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </ImageBackground>
        </TouchableWithoutFeedback>
  );  
}

const styles = StyleSheet.create({
  container: {
     flex: 1, padding: 20 
  },
  borderContainer: {
    borderColor: 'rgba(5,120,150,1)',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 40,
  },

  taskText: {
    fontSize: 16, // タスク名のフォントサイズ
    color: '#333', // タスク名の色
  },
  titleContainer:{
    textAlign:'center',
    marginTop:0,
    marginRight:0,
    marginLeft:0,
    padding:10,
    paddingRight:121,
    paddingLeft:121,
    borderWidth:2,
    borderColor:'rgba(5,120,150,1)',
    backgroundColor:'rgba(5,120,150,1)',
    borderRadius:20,
    color:'white'
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor:'rgba(5,120,150,1)',
    padding:8,
    borderRadius:7,
  },

  // タスク名右上に表示するバッジ
  badgeOnTask: {
    backgroundColor: '#046576', // バッジの背景色
    borderRadius: 10, // バッジの丸み
    paddingHorizontal: 6, // バッジの横パディング
    paddingVertical: 2, // バッジの縦パディング
    position: 'absolute', // タスク名の右上に固定表示
    top: -5, // タスク名の上側に少し余白を取る
    right: -10, // タスク名の右側に少し余白を取る
  },
  newTaskContainer: {
    flexDirection:"row",
  },


  
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#737373',
    padding: 13,
    marginVertical: 20,
    marginLeft: 5,
    width: '80%',
    borderRadius: 10,
    left:10,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#ff914d',
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    top:25,
    left:15,
    height:30
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#FFFFFF',
    width: '90%',
    alignSelf: 'center',
  },
  taskWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#046576',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  majorReasonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  majorReasonItem: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  minorReasonContainer: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    left:73
  },
  minorReasonItem: {
    width: '48%',
    marginVertical: 5,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedReason: {
    backgroundColor: '#046576',
  },
  selectedReasonText: {
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderColor: '#046576',
    borderWidth: 1,
  },
  closeButtonText: {
    color: '#046576',
    fontWeight: 'bold',
  },
  deleteModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // help
helpButton: {
  backgroundColor: '#a6a6a6',
  borderRadius: 50,
  width: 23,
  height: 23,
  justifyContent: 'center',
  alignItems: 'center',
  position:"absolute",
  left:310,
  bottom:8
},
helpIcon: {
  color: 'white',
  fontSize: 15,
  fontWeight: 'bold',
},
helpModalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
helpText: {
  fontSize: 16,
  lineHeight: 24,
  textAlign: 'center',
  color: '#333',
  marginBottom: 20,
},
closeHelpButton: {
  backgroundColor: '#046576',
  padding: 10,
  borderRadius: 5,
},
closeHelpButtonText: {
  color: 'white',
  fontWeight: 'bold',
},
});
