export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Activities: {
        Row: {
          call_sid: string | null
          created_at: string
          description: string | null
          id: number
          lead_id: number | null
          opportunity_id: number | null
          organization_id: number
          subject: string
          type: Database["public"]["Enums"]["activity_types"]
          updated_at: string
          user_id: string
        }
        Insert: {
          call_sid?: string | null
          created_at?: string
          description?: string | null
          id?: number
          lead_id?: number | null
          opportunity_id?: number | null
          organization_id: number
          subject: string
          type: Database["public"]["Enums"]["activity_types"]
          updated_at?: string
          user_id: string
        }
        Update: {
          call_sid?: string | null
          created_at?: string
          description?: string | null
          id?: number
          lead_id?: number | null
          opportunity_id?: number | null
          organization_id?: number
          subject?: string
          type?: Database["public"]["Enums"]["activity_types"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "Leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "Opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Activity_Participants: {
        Row: {
          activity_id: number
          contact_id: number | null
          created_at: string
          id: number
          role: Database["public"]["Enums"]["activity_roles"]
          user_id: string | null
        }
        Insert: {
          activity_id: number
          contact_id?: number | null
          created_at?: string
          id?: number
          role: Database["public"]["Enums"]["activity_roles"]
          user_id?: string | null
        }
        Update: {
          activity_id?: number
          contact_id?: number | null
          created_at?: string
          id?: number
          role?: Database["public"]["Enums"]["activity_roles"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Activity_Participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "Activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_Participants_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_Participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      B2B_Companies: {
        Row: {
          avatar: string | null
          city_id: number | null
          company_id: number | null
          country_id: number | null
          created_at: string
          description: string | null
          email: string | null
          founded: string | null
          id: number
          industry_id: number | null
          linkedin: string | null
          location: string | null
          metadata: Json | null
          name: string
          phone: string | null
          province_id: number | null
          size_id: number | null
          specialities: string | null
          tagline: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          avatar?: string | null
          city_id?: number | null
          company_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded?: string | null
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          location?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          province_id?: number | null
          size_id?: number | null
          specialities?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar?: string | null
          city_id?: number | null
          company_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded?: string | null
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          location?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          province_id?: number | null
          size_id?: number | null
          specialities?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "B2B_Companies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      B2B_Contacts: {
        Row: {
          city_id: number | null
          company_id: number
          country_id: number | null
          created_at: string
          description: string | null
          email: string | null
          facebook: string | null
          first_name: string | null
          id: number
          instagram: string | null
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          main_phone: string | null
          mobile_phone: string | null
          postal_code: string | null
          province_id: number | null
          street_1: string | null
          street_2: string | null
          street_3: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city_id?: number | null
          company_id: number
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city_id?: number | null
          company_id?: number
          country_id?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          postal_code?: string | null
          province_id?: number | null
          street_1?: string | null
          street_2?: string | null
          street_3?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "B2B_Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contacts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      Call_Logs: {
        Row: {
          call_sid: string
          caller: string | null
          contact_id: number | null
          created_at: string
          duration: string | null
          end_time: string | null
          from: string
          id: number
          price: string | null
          price_unit: string | null
          receiver: string | null
          recording_url: string | null
          start_time: string | null
          status: string | null
          to: string
          type: string
          updated_at: string
        }
        Insert: {
          call_sid: string
          caller?: string | null
          contact_id?: number | null
          created_at?: string
          duration?: string | null
          end_time?: string | null
          from: string
          id?: number
          price?: string | null
          price_unit?: string | null
          receiver?: string | null
          recording_url?: string | null
          start_time?: string | null
          status?: string | null
          to: string
          type: string
          updated_at?: string
        }
        Update: {
          call_sid?: string
          caller?: string | null
          contact_id?: number | null
          created_at?: string
          duration?: string | null
          end_time?: string | null
          from?: string
          id?: number
          price?: string | null
          price_unit?: string | null
          receiver?: string | null
          recording_url?: string | null
          start_time?: string | null
          status?: string | null
          to?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Call_Logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      Cities: {
        Row: {
          country_id: number
          created_at: string
          id: number
          name: string
          province_id: number
          updated_at: string
        }
        Insert: {
          country_id: number
          created_at?: string
          id?: number
          name: string
          province_id: number
          updated_at?: string
        }
        Update: {
          country_id?: number
          created_at?: string
          id?: number
          name?: string
          province_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      Companies: {
        Row: {
          address: string | null
          city_id: number | null
          country_id: number | null
          created_at: string
          id: number
          industry_id: number | null
          linkedin: string | null
          name: string
          organization_id: number
          postal_code: string | null
          province_id: number | null
          size_id: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name: string
          organization_id: number
          postal_code?: string | null
          province_id?: number | null
          size_id?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          id?: number
          industry_id?: number | null
          linkedin?: string | null
          name?: string
          organization_id?: number
          postal_code?: string | null
          province_id?: number | null
          size_id?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Companiesass_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      Contacts: {
        Row: {
          address: string | null
          city_id: number | null
          company_id: number
          country_id: number | null
          created_at: string
          email: string | null
          facebook: string | null
          first_name: string | null
          id: number
          instagram: string | null
          is_valid_email: boolean | null
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          main_phone: string | null
          mobile_phone: string | null
          organization_id: number
          postal_code: string | null
          province_id: number | null
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city_id?: number | null
          company_id: number
          country_id?: number | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          is_valid_email?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          organization_id: number
          postal_code?: string | null
          province_id?: number | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city_id?: number | null
          company_id?: number
          country_id?: number | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: number
          instagram?: string | null
          is_valid_email?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          main_phone?: string | null
          mobile_phone?: string | null
          organization_id?: number
          postal_code?: string | null
          province_id?: number | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Contacts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      Countries: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Currencies: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["currencies"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["currencies"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["currencies"]
          updated_at?: string
        }
        Relationships: []
      }
      Industries: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Invitations: {
        Row: {
          code: string
          created_at: string
          email: string
          id: number
          organization_id: number
          role_id: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: number
          organization_id: number
          role_id: number
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: number
          organization_id?: number
          role_id?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Leads: {
        Row: {
          company_id: number
          created_at: string | null
          id: number
          organization_id: number
          rating_id: number
          source: Database["public"]["Enums"]["source_name"] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string | null
          id?: number
          organization_id: number
          rating_id: number
          source?: Database["public"]["Enums"]["source_name"] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string | null
          id?: number
          organization_id?: number
          rating_id?: number
          source?: Database["public"]["Enums"]["source_name"] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "Ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Opportunities: {
        Row: {
          act_budget: number | null
          act_close_date: string | null
          act_revenue: number | null
          close_reason: Database["public"]["Enums"]["close_reasons"] | null
          confidence: number | null
          contact_id: number | null
          created_at: string
          currency_id: number | null
          current_situation: string | null
          customer_need: string | null
          est_budget: number | null
          est_close_date: string | null
          est_revenue: number | null
          id: number
          index_number: number
          lead_id: number
          notes: string | null
          opportunity_status_id: number
          organization_id: number
          payment_plan: Database["public"]["Enums"]["payment_plans"] | null
          priority: Database["public"]["Enums"]["priority_statuses"]
          proposed_solution: string | null
          rating_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          act_budget?: number | null
          act_close_date?: string | null
          act_revenue?: number | null
          close_reason?: Database["public"]["Enums"]["close_reasons"] | null
          confidence?: number | null
          contact_id?: number | null
          created_at?: string
          currency_id?: number | null
          current_situation?: string | null
          customer_need?: string | null
          est_budget?: number | null
          est_close_date?: string | null
          est_revenue?: number | null
          id?: number
          index_number: number
          lead_id: number
          notes?: string | null
          opportunity_status_id: number
          organization_id: number
          payment_plan?: Database["public"]["Enums"]["payment_plans"] | null
          priority?: Database["public"]["Enums"]["priority_statuses"]
          proposed_solution?: string | null
          rating_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          act_budget?: number | null
          act_close_date?: string | null
          act_revenue?: number | null
          close_reason?: Database["public"]["Enums"]["close_reasons"] | null
          confidence?: number | null
          contact_id?: number | null
          created_at?: string
          currency_id?: number | null
          current_situation?: string | null
          customer_need?: string | null
          est_budget?: number | null
          est_close_date?: string | null
          est_revenue?: number | null
          id?: number
          index_number?: number
          lead_id?: number
          notes?: string | null
          opportunity_status_id?: number
          organization_id?: number
          payment_plan?: Database["public"]["Enums"]["payment_plans"] | null
          priority?: Database["public"]["Enums"]["priority_statuses"]
          proposed_solution?: string | null
          rating_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "Contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "Currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "Leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_oppotunity_status_id_fkey"
            columns: ["opportunity_status_id"]
            isOneToOne: false
            referencedRelation: "Opportunity_Statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "Ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Opportunity_Statuses: {
        Row: {
          created_at: string
          id: number
          index_number: number
          name: string
          organization_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          index_number: number
          name: string
          organization_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          index_number?: number
          name?: string
          organization_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Opportunity_Statuses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      Organizations: {
        Row: {
          city_id: number | null
          country_id: number | null
          created_at: string
          description: string | null
          id: number
          industry_id: number | null
          lead_source: string | null
          name: string
          province_id: number | null
          sales_size: string | null
          size_id: number | null
          updated_at: string
          website: string
        }
        Insert: {
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          industry_id?: number | null
          lead_source?: string | null
          name: string
          province_id?: number | null
          sales_size?: string | null
          size_id?: number | null
          updated_at?: string
          website: string
        }
        Update: {
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          industry_id?: number | null
          lead_source?: string | null
          name?: string
          province_id?: number | null
          sales_size?: string | null
          size_id?: number | null
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "Organizations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "Industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "Provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Organizations_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "Sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      Priority: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["priority_statuses"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["priority_statuses"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["priority_statuses"]
          updated_at?: string
        }
        Relationships: []
      }
      Provinces: {
        Row: {
          country_id: number
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          country_id: number
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          country_id?: number
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["id"]
          },
        ]
      }
      Ratings: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["rating_name"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["rating_name"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["rating_name"]
          updated_at?: string
        }
        Relationships: []
      }
      Roles: {
        Row: {
          created_at: string
          id: number
          name: Database["public"]["Enums"]["role_names"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: Database["public"]["Enums"]["role_names"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: Database["public"]["Enums"]["role_names"]
          updated_at?: string
        }
        Relationships: []
      }
      Sizes: {
        Row: {
          created_at: string
          id: number
          size_range: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          size_range: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          size_range?: string
          updated_at?: string
        }
        Relationships: []
      }
      Tasks: {
        Row: {
          created_at: string
          date: string
          description: string
          id: number
          is_completed: boolean
          lead_id: number | null
          opportunity_id: number | null
          organization_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: number
          is_completed?: boolean
          lead_id?: number | null
          opportunity_id?: number | null
          organization_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: number
          is_completed?: boolean
          lead_id?: number | null
          opportunity_id?: number | null
          organization_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "Leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "Opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Twilio_Agents: {
        Row: {
          call_receiving_device: string | null
          created_at: string
          id: number
          twilio_number: string | null
          updated_at: string
        }
        Insert: {
          call_receiving_device?: string | null
          created_at?: string
          id?: number
          twilio_number?: string | null
          updated_at?: string
        }
        Update: {
          call_receiving_device?: string | null
          created_at?: string
          id?: number
          twilio_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Twilio_Settings: {
        Row: {
          account_sid: string | null
          api_key: string | null
          api_secret: string | null
          auth_token: string | null
          created_at: string
          enabled: boolean
          id: number
          record_calls: boolean
          twiml_sid: string | null
          updated_at: string
        }
        Insert: {
          account_sid?: string | null
          api_key?: string | null
          api_secret?: string | null
          auth_token?: string | null
          created_at?: string
          enabled?: boolean
          id?: number
          record_calls?: boolean
          twiml_sid?: string | null
          updated_at?: string
        }
        Update: {
          account_sid?: string | null
          api_key?: string | null
          api_secret?: string | null
          auth_token?: string | null
          created_at?: string
          enabled?: boolean
          id?: number
          record_calls?: boolean
          twiml_sid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Users: {
        Row: {
          created_at: string
          email: string
          expectation: string[] | null
          first_name: string
          google_refresh_token: string | null
          id: string
          last_name: string | null
          linkedin: string | null
          organization_id: number | null
          phone: string | null
          photo: string | null
          role_id: number | null
          status: Database["public"]["Enums"]["user_statuses"]
          twilio_agent_id: number | null
          twilio_setting_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expectation?: string[] | null
          first_name: string
          google_refresh_token?: string | null
          id: string
          last_name?: string | null
          linkedin?: string | null
          organization_id?: number | null
          phone?: string | null
          photo?: string | null
          role_id?: number | null
          status?: Database["public"]["Enums"]["user_statuses"]
          twilio_agent_id?: number | null
          twilio_setting_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expectation?: string[] | null
          first_name?: string
          google_refresh_token?: string | null
          id?: string
          last_name?: string | null
          linkedin?: string | null
          organization_id?: number | null
          phone?: string | null
          photo?: string | null
          role_id?: number | null
          status?: Database["public"]["Enums"]["user_statuses"]
          twilio_agent_id?: number | null
          twilio_setting_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "Organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_twilio_agent_id_fkey"
            columns: ["twilio_agent_id"]
            isOneToOne: true
            referencedRelation: "Twilio_Agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Users_twilio_setting_id_fkey"
            columns: ["twilio_setting_id"]
            isOneToOne: true
            referencedRelation: "Twilio_Settings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_industries: {
        Args: {
          param_user_id: string
          user_role_id: number
          param_organization_id: number
          start_date: string
          end_date: string
        }
        Returns: {
          industries: string
          total: number
        }[]
      }
      get_lost_reason: {
        Args: {
          user_id: string
          user_role_id: number
          param_organization_id: number
          start_date: string
          end_date: string
        }
        Returns: {
          lost_reason: string
          total: number
        }[]
      }
      get_ratings: {
        Args: {
          user_id: string
          user_role_id: number
          param_organization_id: number
          start_date: string
          end_date: string
        }
        Returns: {
          rating: string
          total: number
        }[]
      }
      get_sizes: {
        Args: {
          param_user_id: string
          user_role_id: number
          param_organization_id: number
          start_date: string
          end_date: string
        }
        Returns: {
          sizes: string
          total: number
        }[]
      }
    }
    Enums: {
      activity_roles: "author" | "assignee" | "called"
      activity_types:
        | "closed as won"
        | "closed as lost"
        | "reopened"
        | "qualified"
        | "disqualified"
        | "note"
        | "called"
        | "missed call"
        | "attempted to call"
        | "email"
        | "assigned"
        | "lead created"
        | "opportunity created"
      close_reasons:
        | "pricing"
        | "competition"
        | "long sales cycle"
        | "communication"
        | "decision making"
        | "others"
      company_statuses: "new" | "qualified" | "disqualified"
      contact_statuses: "new" | "qualified" | "disqualified"
      currencies: "idr" | "usd"
      disqualify_reasons:
        | "lost"
        | "cannot contact"
        | "no longer interested"
        | "canceled"
      lead_statuses: "new" | "contacted" | "qualified" | "disqualified"
      method_name: "email" | "note" | "call"
      opportunity_statuses:
        | "qualified"
        | "proposal send"
        | "contract send"
        | "won"
        | "lost"
      payment_plans: "one-time" | "weekly" | "monthly" | "annually"
      priority_statuses: "urgent" | "high" | "medium" | "low"
      rating_name: "cool" | "warm" | "hot"
      role_names: "owner" | "admin" | "manager" | "sales"
      source_name:
        | "google"
        | "linkedin"
        | "manual"
        | "idb2b"
        | "workfrom"
        | "b2b database"
      user_statuses: "active" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
