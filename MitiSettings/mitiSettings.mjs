const defaultobject = {
  ADMIN: {
    id: "admin",
    info: {
      email: { type: "string", pretty: "Email" },
      phone: { type: "string", pretty: "Phone Number" },
    },
  },
  REGULAR: {
    id: "regular",
    info: {
      email: { type: "string", pretty: "Email" },
      lastname: { type: "string", pretty: "Last Name" },
    },
  },
};
class MitiSettings {
  object;
  allowedTypes = [{ string: "VARCHAR(80)" }, { int: "int" }];
  constructor(newObject = defaultobject) {
    if (this.validateObject(newObject)) {
      this.object = newObject;
    } else {
      throw new Error("Problem with the settings");
    }
  }

  getUserTypes() {
    let newObject = {};
    for (const item in this.object) {
      newObject[item] = this.object[item].id;
    }
    return newObject;
  }

  getAllowedTypes() {
    const allowedTypes = this.allowedTypes.map((typeObj) => {
      const typeString = Object.keys(typeObj)[0];
      return typeString;
    });
    return allowedTypes;
  }

  validateObject(newObject) {
    const idSet = new Set();
    for (const role in newObject) {
      const user = newObject[role];
      if (!role) {
        return false; // Role name missing
      }
      if (!user.id || typeof user.id !== "string") {
        return false; // Missing or invalid id
      }
      if (idSet.has(user.id)) {
        return false; // Duplicate id found
      }
      idSet.add(user.id);
      if (!user.info || typeof user.info !== "object") {
        return false; // Missing or invalid info object
      }
      const infoAttributes = Object.keys(user.info);
      if (infoAttributes.length === 0) {
        return false; // At least one attribute is required in the info object
      }
      for (const attr of infoAttributes) {
        if (
          !user.info[attr] ||
          typeof user.info[attr] !== "object" ||
          typeof user.info[attr].pretty !== "string" ||
          (typeof user.info[attr].type !== "string" &&
            !this.getTypes().includes(user.info[attr].type))
        ) {
          return false; // Invalid attribute format in info
        }
      }
    }

    return true;
  }

  getUserFields(userId) {
    if (this.getUserTypes()[userId]) {
      const userInfo = this.object[userId].info;
      const rows = [];
      for (const prop in userInfo) {
        rows.push({ name: prop, pretty: userInfo[prop].pretty });
      }
      return rows;
    } else {
      // Handle the case when the userId is not found
      console.error(`User with ID ${userId} not found.`);
      return [];
    }
  }

  checkUserInfo(id, userinfo) {
    const userType = this.object[this.reverseUsrType(id)];
    if (!userType) {
      return false;
    }

    const requiredFields = Object.keys(userType.info);
    for (const field of requiredFields) {
      if (!(field in userinfo)) {
        return false;
      }
    }

    return true;
  }

  getSqlInfo(userId) {
    const roleInfo = this.object[userId].info;
    const typeMapping = {};
    Object.keys(roleInfo).forEach((property) => {
      const propertyType = roleInfo[property].type;
      const allowedType = this.allowedTypes.find((type) => type[propertyType]);
      if (allowedType) {
        typeMapping[property] = allowedType[propertyType];
      }
    });
    return typeMapping;
  }
  reverseUsrType(val) {
    const utypes = this.getUserTypes();
    for (const role in utypes) {
      if (utypes[role] === val) {
        return role;
      }
    }
    return null;
  }
  checkType(usertype) {
    return !!this.reverseUsrType(usertype);
  }
}

export default MitiSettings;
