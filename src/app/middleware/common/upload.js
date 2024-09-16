import multer from "multer";
import {FileUpload} from "@/utils/types";
import _ from "lodash";

const defaultMulter = multer({
    storage: multer.memoryStorage(),
});

export function upload(req, res, next) {
    
    const newNext = function (err) {
        if (err) {
            return next(err);
        }
        
        try {
            const files = req.files;
            const newBody = {};
            _.forEach(req.body, (value, key) => {
                _.set(newBody, key, value);
            });
            req.body = newBody;

            if (files) {
                for (let file of files) {
                    const fieldname = file.fieldname;
                    file = new FileUpload(file);

                    const fieldNameInBody = _.get(req.body, fieldname);

                    if (fieldNameInBody) {
                        if (_.isArray(fieldNameInBody)) {
                            _.set(req.body, fieldname, [...fieldNameInBody, file]);
                        } else {
                            _.set(req.body, fieldname, [fieldNameInBody, file]);
                        }
                    } else {
                        _.set(req.body, fieldname, file);
                    }
                }

                delete req.files;
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    defaultMulter.any()(req, res, newNext);
}
