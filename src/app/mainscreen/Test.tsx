import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { firestore } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type Tendency = {
  id: string;
  name: string;
  score: number;
};

const Test = () => {
  const [tendencies, setTendencies] = useState<Tendency[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTendency, setSelectedTendency] = useState<Tendency | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<Tendency | null>(null);

  useEffect(() => {
    const fetchTendencies = async () => {
      try {
        const membersSnapshot = await getDocs(collection(firestore, 'members'));
        const allTendencies: Tendency[] = [];

        for (const memberDoc of membersSnapshot.docs) {
          const tendenciesCollectionRef = collection(firestore, `members/${memberDoc.id}/tendencies`);
          const tendenciesQuery = query(tendenciesCollectionRef, orderBy('score', 'desc'), limit(10));
          const tendenciesSnapshot = await getDocs(tendenciesQuery);

          const memberTendencies = tendenciesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Tendency[];

          allTendencies.push(...memberTendencies);
        }

        const sortedTendencies = allTendencies.sort((a, b) => b.score - a.score);

        if (sortedTendencies.length === 0) {
          console.warn('No tendencies data found in Firestore.');
        }

        setTendencies(sortedTendencies);
      } catch (error) {
        console.error("Error fetching tendencies: ", error);
      }
    };

    fetchTendencies();
  }, []);

  const handleItemPress = (tendency: Tendency) => {
    setSelectedTendency(tendency);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTendency(null);
  };

  const setAsWeeklyGoal = () => {
    if (selectedTendency) {
      setWeeklyGoal(selectedTendency);
      closeModal();
    }
  };

  const renderItem = ({ item, index }: { item: Tendency; index: number }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={[styles.itemContainer, index < 3 && styles.highlightedItem]}>
        {index < 3 ? (
          <View style={styles.indexContainer}>
            <FontAwesome name="star" size={24} color={index === 0 ? "gold" : index === 1 ? "silver" : "#cd7f32"} />
            <Text style={styles.index}>{index + 1}</Text>
          </View>
        ) : (
          <Text style={styles.normalIndex}>{index + 1}</Text>
        )}
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemScore}>{item.score}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.actionPlanTitleHeader}>今週の行動目標</Text>
        {weeklyGoal ? (
          <View style={styles.weeklyGoalContainer}>
            <Text style={styles.weeklyGoalText}>{weeklyGoal.name}</Text>
          </View>
        ) : (
          <Text style={styles.noGoalText}>行動目標が設定されていません。</Text>
        )}
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>先延ばし傾向診断結果</Text>
        <FlatList
          data={tendencies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {selectedTendency && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedTendency.name}</Text>
              <Text style={styles.modalContent}>詳細な情報がここに表示されます。</Text>
              <TouchableOpacity onPress={setAsWeeklyGoal} style={styles.setGoalButton}>
                <Text style={styles.setGoalButtonText}>今週の行動目標に設定</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F9',
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  actionPlanTitleHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#FF8A33',
  },
  weeklyGoalContainer: {
    backgroundColor: '#FFE4D0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  weeklyGoalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5C1B',
    textAlign: 'center',
  },
  noGoalText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  highlightedItem: {
    backgroundColor: '#FFF9E6',
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  index: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginLeft: 5,
  },
  normalIndex: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    color: '#4A4A4A',
    marginLeft: 10,
  },
  itemScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5C1B',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4A4A4A',
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  closeButton: {
    backgroundColor: '#FF5C1B',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  setGoalButton: {
    backgroundColor: '#FF5C1B',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  setGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default Test;