import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid2 from '@mui/material/Grid2';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    const [userName, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');

    const [formState, setFormState] = React.useState(0);  // 0 -> Login, 1 -> Register
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {  // Login
                let result = await handleLogin(userName, password);
                console.log(result);
                setUsername('');
                setPassword('');
            } if (formState === 1) {  // Register
                let result = await handleRegister(name, userName, password);
                console.log(result);
                setUsername('');
                setPassword('');
                setName('');
                setMessage(result);
                setOpen(true);
                setError('');
                setFormState(0);  // Switch to login mode after successful registration
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    };

    // Clear username, password and name when switching between Sign In and Sign Up
    const handleFormSwitch = (formType) => {
        setFormState(formType);
        // setUsername('');
        setPassword('');
        setName('');  // Reset name field too for Sign Up
        setError('');  // Clear any previous error messages
    };

     const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);  // Close the snackbar
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid2 container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid2
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid2 item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <div>
                            <Button
                                variant={formState === 0 ? "contained" : ""}
                                onClick={() => handleFormSwitch(0)}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={formState === 1 ? "contained" : ""}
                                onClick={() => handleFormSwitch(1)}
                            >
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="userName"
                                value={userName}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                            />
                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid2>
            </Grid2>

            <Snackbar
                open={open}
                autoHideDuration={4000}  // The snackbar will disappear after 4 seconds
                message={message}
                onClose={handleClose}    // Handle close event
            />
        </ThemeProvider>
    );
}
