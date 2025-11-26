import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" className="flex items-center justify-center min-h-screen">
      <Box className="text-center">
        <Typography variant="h3" component="h1" className="mb-4 font-bold text-gray-800">
          Welcome to Mobile Management
        </Typography>
        <Typography variant="h6" className="mb-8 text-gray-600">
          Please login to continue
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Login
        </Button>
      </Box>
    </Container>
  );
};

export default WelcomePage;

