import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Formulario = () => {
    const [error, setError] = useState('');
    const [modoRegistro, setModoRegistro] = useState(false);
    const navigate = useNavigate();
    const [datos, setDatos] = useState({ email: '', password: '' });
    const auth = getAuth();

    const manejarCambio = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError(''); 

        try {
            await setPersistence(auth, browserLocalPersistence);

            if (modoRegistro) {

                await createUserWithEmailAndPassword(auth, datos.email, datos.password);
                console.log("Usuario registrado ok");

            } else {

                await signInWithEmailAndPassword(auth, datos.email, datos.password);
                console.log("Inicio de sesión correcto");

            }

            navigate('/productos');
        } catch (error) {

            console.error("Error en la autenticación:", error.message);

            setError(error.message);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg">
                        <div className="card-body">
                            <h2 className="text-center mb-4">{modoRegistro ? "Registrar Usuario" : "Iniciar Sesión"}</h2>
                            {error && <p className="text-danger text-center">{error}</p>}
                            <form onSubmit={manejarEnvio}>
                                <div className="mb-3">
                                    <label className="form-label">Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={datos.email}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña:</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={datos.password}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">
                                        {modoRegistro ? "Registrar" : "Iniciar Sesión"}
                                    </button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <button
                                    onClick={() => setModoRegistro(!modoRegistro)}
                                    className="btn btn-link"
                                >
                                    {modoRegistro ? "Inicia Sesión" : "Regístrate"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Formulario;
