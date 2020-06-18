import { RequestHandler, NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user'

export const auth = async (req: Request, res: Response, next: NextFunction): void => {
  
}