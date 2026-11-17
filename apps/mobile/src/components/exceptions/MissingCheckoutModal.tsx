import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AmberButton } from '../ui/AmberButton';

export interface MissingCheckoutModalProps {
  visible: boolean;
  shiftDate?: string;
  onClose: () => void;
  onSubmitNote: (note: string) => Promise<void>;
}

export const MissingCheckoutModal: React.FC<MissingCheckoutModalProps> = ({
  visible,
  shiftDate = 'yesterday',
  onClose,
  onSubmitNote,
}) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) {
      Alert.alert('Note Required', 'Please enter a brief reason for your missing check-out.');
      return;
    }

    setLoading(true);
    try {
      await onSubmitNote(note);
      onClose();
    } catch {
      Alert.alert('Error', 'Unable to submit missing checkout note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.alertIconBox}>
            <Text style={styles.alertIcon}>⚠️</Text>
          </View>

          <Text style={styles.title}>Missing Check-Out</Text>
          <Text style={styles.desc}>
            You did not record a check-out for your shift on {shiftDate}. Please provide an explanation note for your supervisor.
          </Text>

          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Left early due to client emergency / phone battery died..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          <AmberButton
            title="Submit Explanation"
            loading={loading}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Dismiss for Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  alertIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy[900],
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: colors.navy[900],
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
});

