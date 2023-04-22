import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// import "boxicons";
import './CommentSection.css'

const CommentSection = ({ animeId, episodeId }) => {
  const [comments, setComments] = useState([]);
  const { currentUser } = useAuth();
  const [uploadedImageName, setUploadedImageName] = useState("");

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setUploadedImageName(event.target.files[0].name);
    } else {
      setUploadedImageName("");
    }
  };

  const addComment = async (comment, imageFile) => {
    let imageURL = null;

    if (imageFile) {
      const storageRef = ref(storage, `images/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Puedes mostrar el progreso de la subida aquí
          },
          (error) => {
            console.log("Error al subir la imagen:", error);
            reject(error);
          },
          async () => {
            imageURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }

    await addDoc(
      collection(
        db,
        "animes",
        animeId,
        "episodes",
        episodeId,
        "comments"
      ),
      {
        comment,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        imageURL, // Guarda la URL de la imagen en la base de datos
      }
    );
  };

  useEffect(() => {
    // Obtén la referencia a la colección de comentarios
    const commentsRef = collection(
      db,
      "animes",
      animeId,
      "episodes",
      episodeId,
      "comments"
    );

    // Suscríbete a los cambios en los comentarios y actualiza el estado local
    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setComments(newComments);
    });

    // Limpia las suscripciones cuando el componente se desmonte
    return () => {
      unsubscribeComments();
    };
  }, [animeId, episodeId]);

  return (
    <div className="comments">
      <h2>Comentarios</h2>
      {currentUser ? (
        <div className="comments-section-ep">
          <div className="input-container-ep">
         
            <textarea id="comment" />
            <div className="button-and-upload-ep">
            <div className="icon">
          <box-icon
            name="image-add"
            onClick={() => {
              document.getElementById("image").click();
            }}
          />
          <span>{uploadedImageName}</span>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="image-upload"
            onChange={handleImageChange}
            hidden
          />
        </div>
        <button
            onClick={() => {
              const commentInput = document.getElementById("comment");
              const imageInput = document.getElementById("image");

              // Verifica si el comentario no está vacío
              if (commentInput.value.trim().length > 0) {
                (async () => {
                  await addComment(
                    commentInput.value,
                    imageInput.files[0]
                  );
                  commentInput.value = "";
                  imageInput.value = "";

                  // Agrega esta línea para eliminar el nombre de la imagen
                  setUploadedImageName("");
                })();
              } else {
                
              }
            }}
          >
            Comentar
          </button>
            </div>
          </div>
        </div>
      ) : (
        <div>Por favor, inicia sesión para dejar un comentario.</div>
      )}
      {comments.map((comment) => (
        <div className="AniComments-ep" key={comment.id}>
          <img
            className="user-photo"
            src={comment.userPhotoURL}
            alt="User"
          />
          <div className="comment-text">
            <span className="user-name">{comment.userName}</span>
            <span className="comment">{comment.comment}</span>
            {comment.imageURL && (
            <img
              className="comment-image"
              src={comment.imageURL}
              alt="Comment"
            />
          )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;