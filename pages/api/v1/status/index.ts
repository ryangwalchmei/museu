import { NextApiRequest, NextApiResponse } from "next";

function status(req: NextApiRequest, res: NextApiResponse) {
  return res
    .status(200)
    .json({ message: "Alunos do Trainerfit são pessoas acima da média" });
}

export default status;
