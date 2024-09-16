import {responseSuccess} from "@/utils/helpers";
import * as categoryService from "../services/dashboard.service";

export async function getInfoDashboard(req, res) {
    return responseSuccess(res, await categoryService.getInfoDashboard());
}

