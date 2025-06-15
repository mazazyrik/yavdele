import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, List, ListItem, ListItemText, Stack, Divider, Alert } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/question/1');
  };

  const handleCheckTest = () => {
    navigate('/check-results');
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 6,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: 800,
            borderRadius: 5,
            boxShadow: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 70, color: 'primary.main', mb: 1 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
            Тест MoCA
          </Typography>
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              <b>Демо-версия</b> | Проект в разработке
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Тест полностью <b>анонимен</b>. Ваши данные нигде не сохраняются и не используются для идентификации.
            </Typography>
          </Alert>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            <b>Montreal Cognitive Assessment (MoCA)</b> — это 30-балльный тест для выявления <b>лёгких когнитивных нарушений и деменции</b>.
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" paragraph>
            Этот сайт создан для облегчения раннего выявления когнитивных нарушений у взрослых. Данный сервис работает в демонстрационном режиме и не является медицинским продуктом. После прохождения теста результаты будут отправлены администратору для проверки. Проект находится в активной разработке.
            <br />
            <b>Если вы получили низкий результат, рекомендуется немедленно обратиться к врачу!</b>
          </Typography>
          <Divider sx={{ width: '100%', my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalHospitalIcon color="error" sx={{ fontSize: 32 }} />
            <Typography variant="h6" color="error" sx={{ fontWeight: 600 }}>
              Медицинский сервис
            </Typography>
          </Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 1, textAlign: 'center' }}>
            Тест включает следующие разделы:
          </Typography>
          <List sx={{ width: '100%' }}>
            <ListItem disablePadding>
              <ListItemText primary="Ориентировка во времени и месте" secondary="6 баллов" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Запоминание слов" secondary="5 баллов" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Внимание" secondary="6 баллов" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Речь" secondary="3 балла" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Абстрактное мышление" secondary="2 балла" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Тест с часами" secondary="4 балла" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Отсроченное воспроизведение" secondary="5 баллов" />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Ориентировка в пространстве" secondary="1 балл" />
            </ListItem>
          </List>
          <Divider sx={{ width: '100%', my: 2 }} />
          <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartTest}
              sx={{ width: { xs: '100%', sm: 260 }, fontSize: 20, py: 2, borderRadius: 3, fontWeight: 600 }}
            >
              Перейти к тесту
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleCheckTest}
              sx={{ width: { xs: '100%', sm: 260 }, fontSize: 20, py: 2, borderRadius: 3, fontWeight: 600 }}
            >
              Проверить результат теста
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 