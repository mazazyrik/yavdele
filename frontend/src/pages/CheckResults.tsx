import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

interface TestResult {
  test_id: number;
  date_of_test: string;
  points: number | null;
}

const CheckResults: React.FC = () => {
  const navigate = useNavigate();
  const [testId, setTestId] = useState<string>('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCheck = () => {
    if (!testId) {
      setError('Пожалуйста, введите ID теста');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    fetch(`http://194.87.216.212:8000/api/test/${testId}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Тест не найден');
        }
        return response.json();
      })
      .then(data => {
        setResult(data);
      })
      .catch(error => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          }}
        >
          <MedicalServicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Проверка результатов
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Введите ID теста, чтобы проверить результаты
          </Typography>

          <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="ID теста"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              onClick={handleCheck}
              disabled={loading}
              sx={{ minWidth: '120px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Проверить'}
            </Button>
          </Box>

          {result && (
            <Box sx={{ width: '100%', mt: 2 }}>
              {result.points !== null ? (
                <Alert severity="success">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MedicalServicesIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h5" gutterBottom>
                      Результат: {result.points} баллов
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Дата теста: {new Date(result.date_of_test).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {result.points >= 26 && (
                      <>
                        <Typography variant="body1" color="success.main" gutterBottom>
                          Вы молодец! Ваши когнитивные способности на высоте. Риск развития деменции минимален (около 2%).
                        </Typography>
                      </>
                    )}
                    {result.points >= 18 && result.points <= 25 && (
                      <>
                        <Typography variant="body1" color="warning.main" gutterBottom>
                          Обнаружены лёгкие когнитивные нарушения. Рекомендуется наблюдение. Риск деменции — около 15%.
                        </Typography>
                      </>
                    )}
                    {result.points < 18 && (
                      <>
                        <Typography variant="body1" color="error.main" gutterBottom>
                          Возможны выраженные когнитивные нарушения. Рекомендуется обратиться к врачу. Риск деменции — выше 30%.
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Интерпретация результатов MoCA:
                  </Typography>
                  <Typography variant="body2">• 26–30 баллов: Норма</Typography>
                  <Typography variant="body2">• 18–25 баллов: Лёгкие когнитивные нарушения</Typography>
                  <Typography variant="body2">• Менее 18 баллов: Возможная деменция или другие когнитивные нарушения</Typography>
                </Alert>
              ) : (
                <Alert severity="info">
                  <Typography variant="h6" gutterBottom>
                    Тест ещё не проверен администратором
                  </Typography>
                  <Typography variant="body2">
                    Пожалуйста, попробуйте позже. Как только тест будет проверен, здесь появится ваша оценка.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            На главную
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default CheckResults; 