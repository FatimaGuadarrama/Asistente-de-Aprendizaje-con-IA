import mongoose from "mongoose";

const DocumentPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    role: {
      type: String,
      enum: ["creator", "viewer"],
      default: "viewer",
    },
    sharedCode: {
      type: String, // código para compartir acceso
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true, // guarda createdAt y updatedAt automáticamente
  }
);

// Evita duplicados- un mismo usuario no puede tener dos permisos distintos sobre el mismo documento
DocumentPermissionSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const DocumentPermission = mongoose.model("DocumentPermission", DocumentPermissionSchema);

export default DocumentPermission;