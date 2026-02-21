import { diskStorage } from "multer"

export const storage = (path = "./uploads/general") => {
  return diskStorage({
    filename(req, file, callback) {
      const uniqueFileName = Date.now() + "-" + file.originalname;
      callback(null, uniqueFileName)
    },
    destination: path
  })}