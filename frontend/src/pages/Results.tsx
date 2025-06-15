import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HealingIcon from '@mui/icons-material/Healing';

// Автопроверка ответов
function autoScore(answers: Record<number, any>): number {
  let score = 0;
  // 1. Ориентировка во времени и месте (6 баллов)
  if (answers[1]) {
    const words = ['дата', 'месяц', 'год', 'день', 'город', 'учреждение'];
    const ans = answers[1].toLowerCase();
    score += words.reduce((acc, w) => acc + (ans.includes(w) ? 1 : 0), 0);
  }
  // 2. Запоминание слов (5 баллов)
  if (answers[2]) {
    const words = ['лист', 'церковь', 'цветок', 'перо', 'красный'];
    const ans = answers[2].toLowerCase();
    score += words.reduce((acc, w) => acc + (ans.includes(w) ? 1 : 0), 0);
  }
  // 3. Внимание (повторение цифр) (3 балла)
  if (answers[3]) {
    if (answers[3].replace(/\D/g, '') === '582') score += 3;
  }
  // 4. Внимание (обратный порядок) (3 балла)
  if (answers[4]) {
    if (answers[4].replace(/\D/g, '') === '741') score += 3;
  }
  // 5. Таппинг (6 баллов)
  if (answers[5]) {
    // 3 буквы "А" в последовательности, максимум 6 баллов
    const taps = (answers[5].match(/tap/g) || []).length;
    score += Math.min(taps, 6);
  }
  // 6. Речь (фраза) (1 балл)
  if (answers[6]) {
    if (answers[6].toLowerCase().includes('никаких если, и или но')) score += 1;
  }
  // 7. Животные (2 балла)
  if (answers[7]) {
    const animals = ['лев', 'носорог', 'верблюд'];
    let found = 0;
    Object.values(answers[7]).forEach((val: any) => {
      animals.forEach(animal => {
        if (typeof val === 'string' && val.toLowerCase().includes(animal)) found++;
      });
    });
    score += Math.min(found, 2);
  }
  // 8. Абстрактное мышление (2 балла)
  if (answers[8]) {
    if (answers[8].toLowerCase().includes('фрук')) score += 2;
  }
  // 9. Часы (4 балла) — автопроверка невозможна, дадим 0
  // 10. Отсроченное воспроизведение (5 баллов)
  if (answers[10]) {
    const words = ['лист', 'церковь', 'цветок', 'перо', 'красный'];
    const ans = answers[10].toLowerCase();
    score += words.reduce((acc, w) => acc + (ans.includes(w) ? 1 : 0), 0);
  }
  // 11. Ориентировка в пространстве (1 балл)
  if (answers[11]) {
    if (/\d/.test(answers[11])) score += 1;
  }
  return score;
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testId = location.state?.testId;
  const answers = location.state?.answers;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [autoPoints, setAutoPoints] = useState<number|null>(null);

  useEffect(() => {
    if (answers) {
      setAutoPoints(autoScore(answers));
    }
  }, [answers]);

  const handleCheckResults = () => {
    navigate('/check-results');
  };

  const handleCopy = () => {
    if (testId) {
      navigator.clipboard.writeText(testId.toString());
      setSnackbarOpen(true);
    }
  };

  if (testId === 'error') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Alert severity="error">
            Произошла ошибка при сохранении результатов теста. Пожалуйста, попробуйте еще раз.
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            <HealingIcon sx={{ fontSize: 48, color: 'success.main' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Тест MoCA завершен
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Ваши ответы успешно сохранены. Администратор проверит тест и выставит оценку.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              ID теста: {testId}
            </Typography>
            <Tooltip title="Скопировать ID">
              <IconButton onClick={handleCopy} color="primary" size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            message="ID скопирован!"
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
          {autoPoints !== null && (
            <Alert severity="info" sx={{ width: '100%', my: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealingIcon color="success" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" color="primary">
                  Ваш предположительный балл: {autoPoints} из 30
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обратите внимание: проверка осуществляется ИИ, который находится в ранней версии и требует доработки. Рекомендуется дождаться результатов от врача (администратора).
                </Typography>
              </Box>
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" paragraph>
            Сохраните этот ID для проверки результатов позже
          </Typography>

          <Divider sx={{ width: '100%', my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Интерпретация результатов MoCA:
          </Typography>
          <Box sx={{ width: '100%', textAlign: 'left' }}>
            <Typography variant="body2" paragraph>
              • 26-30 баллов: Норма
            </Typography>
            <Typography variant="body2" paragraph>
              • 18-25 баллов: Легкие когнитивные нарушения
            </Typography>
            <Typography variant="body2" paragraph>
              • Менее 18 баллов: Возможная деменция или другие когнитивные нарушения
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleCheckResults}>
              Проверить результаты
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              На главную
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Results; 