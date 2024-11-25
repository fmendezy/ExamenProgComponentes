import React, { useState, useEffect } from 'react';
import Producto from './Producto'; 
import { db } from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ListaProductos = () => {
    const [Carro, setCarro] = useState({});
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsuscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUsuario(user);
                console.log('User logeado:', user);
                await cargarCarro(user.uid);
            } else {
                console.log('No tenemos user logeados, redirigiendo');
                navigate('/');
            }
        });
        return () => unsuscribe();
    }, [navigate]);

    const productos = [

        { id: 1, nombre: 'Zapatillas', precio: 300, imagen: '/imagenes/zapatilla.png' },
        { id: 2, nombre: 'Polera', precio: 200, imagen: '/imagenes/polera.png' },
        { id: 3, nombre: 'Chaleco', precio: 100, imagen: '/imagenes/chaleco.jpg' },

    ];

    const guardarCarroEnFirebase = async (nuevoCarro) => {
        if (usuario) {
            const CarroArray = Object.values(nuevoCarro).map((item) => ({
                producto: item.producto,
                cantidad: item.cantidad,
            }));

            try {
                const q = query(collection(db, 'Carros'), where('usuarioId', '==', usuario.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach(async (docSnapshot) => {
                        await updateDoc(doc(db, 'Carros', docSnapshot.id), { Carro: CarroArray });
                    });
                } else {
                    await setDoc(doc(collection(db, 'Carros')), {
                        usuarioId: usuario.uid,
                        Carro: CarroArray,
                    });
                }

                console.log("Carro guardado correctamente en Firebase");

            } catch (error) {

                console.error("Error al guardar el Carro en Firebase:", error);
            }
        }
    };

    const agregarAlCarro = (producto) => {
        const nuevoCarro = { ...Carro };

        if (nuevoCarro[producto.id]) {
            nuevoCarro[producto.id].cantidad += 1;
        } else {
            nuevoCarro[producto.id] = { producto, cantidad: 1 };
        }

        setCarro(nuevoCarro);
        guardarCarroEnFirebase(nuevoCarro);

    };

    const eliminarDelCarro = (productoId) => {
        const nuevoCarro = { ...Carro };

        if (nuevoCarro[productoId]) {
            nuevoCarro[productoId].cantidad -= 1;

            if (nuevoCarro[productoId].cantidad === 0) {
                delete nuevoCarro[productoId];
            }

            setCarro(nuevoCarro);
            guardarCarroEnFirebase(nuevoCarro);
        }
    };

    const cargarCarro = async (uid) => {
        try {
            const productosCargados = {};
            const q = query(collection(db, 'Carros'), where('usuarioId', '==', uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.Carro && Array.isArray(data.Carro)) {
                        data.Carro.forEach((item) => {
                            const { producto, cantidad } = item;
                            productosCargados[producto.id] = { producto, cantidad };
                        });
                    }
                });
                setCarro(productosCargados);
                console.log("Se cargo el carro desde Firebase.");
            } else {
                console.log("El user no tiene carros.");
                setCarro({});
            }
        } catch (error) {
            console.error("Error en Firebase al cargar:", error);
        }
    };

    const cerrarSesion = async () => {
        const auth = getAuth();
        try {

            await signOut(auth);
            console.log("Sesión cerrada");
            navigate('/');

        } catch (error) {

            console.error("Error al cerrar sesión:", error);
        }
    };

    return (

        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lista de Productos</h1>
                <button onClick={cerrarSesion} class="btn btn-info">
                    Cerrar Sesión
                </button>
            </div>

            {usuario ? (
                <div>
                    <h2 className="text-center mb-4">Bienvenido, {usuario.email.split('@')[0]}</h2>
                    <div className="row">
                        {productos.map((producto) => (
                            <div key={producto.id} className="col-md-4 mb-4">
                                <Producto
                                    producto={producto}
                                    agregarAlCarro={agregarAlCarro}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-danger">Inicia sesión para ver los productos.</p>
            )}

            <div className="mt-5">
                <h2>Carro</h2>
                <ul className="list-group">
                    {Object.values(Carro).map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{item.producto.nombre}</span>
                            <div>
                                <span className="badge bg-primary rounded-pill me-3">
                                    {item.cantidad}
                                </span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => eliminarDelCarro(item.producto.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </li>

                    ))}
                </ul>
            </div>

        </div>

    );
};

export default ListaProductos;