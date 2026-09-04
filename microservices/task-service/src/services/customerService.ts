import { Customer, ICustomer } from "@/models/customerModel";
import { Types } from "mongoose";

export class CustomerService {
  public static  instance: CustomerService;

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  async createCustomer(data: {
    firstName: string;
    lastName: string;
    email: string;
    userId:string
  }): Promise<ICustomer> {
    try {
        const customer = await Customer.create(data);
    return customer;
    } catch (error) {
        throw new Error("Failed to create a lead : " + (error as Error)?.message)
    }
  }

  async getCustomerByEmail(email: string): Promise<ICustomer | null> {
    try {
        return Customer.findOne({
      email: email.toLowerCase(),
    });
    } catch (error) {
         throw new Error("Failed to retrieve a lead : " + (error as Error)?.message)
    }
    
  }

  async updateCustomer(
    email: string,
    updates: Partial<{
      firstName: string;
      lastName: string;
      email: string;
    }>
  ): Promise<ICustomer | null> {
   try {
     return Customer.findOneAndUpdate(
      { email: email.toLowerCase() },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
   } catch (error) {
    throw new Error("Failed to update a lead : " + (error as Error)?.message)
   }
  }



     /**
       * Get agents with pagination
       */
       async getCustomers(params: {
          userId: Types.ObjectId;
          page?: number;
          limit?: number;
          search?: string;
      }) {
          
          try {
              const {
              userId,
              page = 1,
              limit = 10,
              search,
          } = params;
  
          const filter:any = {
              userId,
          };
  
          if (search) {
              filter.name = {
                  $regex: search,
                  $options: "i",
              };
          }
  
          const skip = (page - 1) * limit;
  
          const [customers, total] = await Promise.all([
              Customer.find(filter)
                  .sort({ createdAt: -1 })
                  .skip(skip)
                  .limit(limit)
                  .lean(),
  
              Customer.countDocuments(filter),
          ]);
  
          return {
              data: customers,
              pagination: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit),
                  hasNext: page * limit < total,
                  hasPrev: page > 1,
              },
          };
              
          } catch (error) {
               throw new Error("Failed to retrieve a list of  customers : " + (error as Error)?.message)
          }
          
      }
}