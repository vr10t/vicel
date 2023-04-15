export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null;
          location: string;
          destination: string;
          date: string;
          passengers: number;
          distance: string | null;
          service: string;
          return_date: string | null;
          flight_number: string | null;
          first_name: string;
          email: string;
          phone: string;
          last_name: string;
          time: string | null;
          return_time: string | null;
          plane_arriving_from: string | null;
          airline_name: string | null;
          return_first_name: string | null;
          return_email: string | null;
          return_phone: string | null;
          return_service: string | null;
          return_last_name: string | null;
          return_passengers: string | null;
          return_location: string | null;
          return_destination: string | null;
          user_id: string | null;
          id: string;
          total: string;
          status: string | null;
          checkout_session: string | null;
          instructions: string | null;
          secret: string | null;
        };
        Insert: {
          created_at?: string | null;
          location: string;
          destination: string;
          date: string;
          passengers: number;
          distance?: string | null;
          service: string;
          return_date?: string | null;
          flight_number?: string | null;
          first_name: string;
          email: string;
          phone: string;
          last_name: string;
          time?: string | null;
          return_time?: string | null;
          plane_arriving_from?: string | null;
          airline_name?: string | null;
          return_first_name?: string | null;
          return_email?: string | null;
          return_phone?: string | null;
          return_service?: string | null;
          return_last_name?: string | null;
          return_passengers?: string | null;
          return_location?: string | null;
          return_destination?: string | null;
          user_id?: string | null;
          id: string;
          total: string;
          status?: string | null;
          checkout_session?: string | null;
          instructions?: string | null;
          secret?: string | null;
        };
        Update: {
          created_at?: string | null;
          location?: string;
          destination?: string;
          date?: string;
          passengers?: number;
          distance?: string | null;
          service?: string;
          return_date?: string | null;
          flight_number?: string | null;
          first_name?: string;
          email?: string;
          phone?: string;
          last_name?: string;
          time?: string | null;
          return_time?: string | null;
          plane_arriving_from?: string | null;
          airline_name?: string | null;
          return_first_name?: string | null;
          return_email?: string | null;
          return_phone?: string | null;
          return_service?: string | null;
          return_last_name?: string | null;
          return_passengers?: string | null;
          return_location?: string | null;
          return_destination?: string | null;
          user_id?: string | null;
          id?: string;
          total?: string;
          status?: string | null;
          checkout_session?: string | null;
          instructions?: string | null;
          secret?: string | null;
        };
      };
      prices: {
        Row: {
          id: number;
          key: string;
          value: number | null;
          name: string | null;
          hemelS: number | null;
          hemelP: number | null;
          hemelM: number | null;
          lutonS: number | null;
          lutonP: number | null;
          lutonM: number | null;
          watfordS: number | null;
          watfordP: number | null;
          watfordM: number | null;
          kingsS: number | null;
          kingsP: number | null;
          kingsM: number | null;
          abbotsS: number | null;
          abbotsP: number | null;
          abbotsM: number | null;
          redbournS: number | null;
          redbournP: number | null;
          redbournM: number | null;
          albansS: number | null;
          albansP: number | null;
          albansM: number | null;
          bovingdonS: number | null;
          bovingdonP: number | null;
          bovingdonM: number | null;
          tringS: number | null;
          tringP: number | null;
          tringM: number | null;
          berkhamstedS: number | null;
          berkhamstedP: number | null;
          berkhamstedM: number | null;
        };
        Insert: {
          id?: number;
          key: string;
          value?: number | null;
          name?: string | null;
          hemelS?: number | null;
          hemelP?: number | null;
          hemelM?: number | null;
          lutonS?: number | null;
          lutonP?: number | null;
          lutonM?: number | null;
          watfordS?: number | null;
          watfordP?: number | null;
          watfordM?: number | null;
          kingsS?: number | null;
          kingsP?: number | null;
          kingsM?: number | null;
          abbotsS?: number | null;
          abbotsP?: number | null;
          abbotsM?: number | null;
          redbournS?: number | null;
          redbournP?: number | null;
          redbournM?: number | null;
          albansS?: number | null;
          albansP?: number | null;
          albansM?: number | null;
          bovingdonS?: number | null;
          bovingdonP?: number | null;
          bovingdonM?: number | null;
          tringS?: number | null;
          tringP?: number | null;
          tringM?: number | null;
          berkhamstedS?: number | null;
          berkhamstedP?: number | null;
          berkhamstedM?: number | null;
        };
        Update: {
          id?: number;
          key?: string;
          value?: number | null;
          name?: string | null;
          hemelS?: number | null;
          hemelP?: number | null;
          hemelM?: number | null;
          lutonS?: number | null;
          lutonP?: number | null;
          lutonM?: number | null;
          watfordS?: number | null;
          watfordP?: number | null;
          watfordM?: number | null;
          kingsS?: number | null;
          kingsP?: number | null;
          kingsM?: number | null;
          abbotsS?: number | null;
          abbotsP?: number | null;
          abbotsM?: number | null;
          redbournS?: number | null;
          redbournP?: number | null;
          redbournM?: number | null;
          albansS?: number | null;
          albansP?: number | null;
          albansM?: number | null;
          bovingdonS?: number | null;
          bovingdonP?: number | null;
          bovingdonM?: number | null;
          tringS?: number | null;
          tringP?: number | null;
          tringM?: number | null;
          berkhamstedS?: number | null;
          berkhamstedP?: number | null;
          berkhamstedM?: number | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          stripe_customer: string | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          bookings: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          stripe_customer?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          bookings?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          stripe_customer?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          bookings?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year";
      pricing_type: "one_time" | "recurring";
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid";
    };
  };
}
