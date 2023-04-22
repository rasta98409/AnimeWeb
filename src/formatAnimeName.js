export const formatAnimeName = (name) => {
    if (!name) {
      return "";
    }
    // Reemplaza los espacios con guiones y elimina caracteres especiales
    return name.replace(/ /g, "-").replace(/[^\w-]/gi, '');
  };