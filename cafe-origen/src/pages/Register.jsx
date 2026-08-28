import "../css/register.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebaseConfig";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";


function Register() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    password: "",
    confirmarPassword: ""
  });


  const [mensaje, setMensaje] = useState("");


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    if(formData.password !== formData.confirmarPassword){

      setMensaje("Las contraseñas no coinciden");
      return;

    }


    try {


      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );


      const user = userCredential.user;


      await setDoc(doc(db, "usuarios", user.uid), {

        nombre: formData.nombre,
        celular: formData.celular,
        email: formData.email,
        creado: serverTimestamp()

      });


      setMensaje("Registro exitoso");


      setTimeout(()=>{

        navigate("/login");

      },1500);



    } catch(error){

      console.log(error);

      setMensaje(error.message);

    }

  };


  return (

    <div className="register-page">


      <div className="register-card">


        <h1>
          Crear cuenta
        </h1>


        <form onSubmit={handleSubmit}>


          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
          />


          <input
            type="tel"
            name="celular"
            placeholder="Celular"
            value={formData.celular}
            onChange={handleChange}
            required
          />


          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />


          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <input
            type="password"
            name="confirmarPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmarPassword}
            onChange={handleChange}
            required
          />


          <button type="submit">
            Registrarme
          </button>


        </form>


        {
          mensaje &&
          <p>{mensaje}</p>
        }


        <button 
          className="volver"
          onClick={()=>navigate("/login")}
        >
          Ya tengo cuenta
        </button>


      </div>


    </div>

  );

}


export default Register;