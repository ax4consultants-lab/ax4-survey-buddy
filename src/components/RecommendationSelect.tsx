import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Survey } from "@/types/survey";

interface RecommendationSelectProps {
  documentType: Survey['documentType'];
  value: string;
  onValueChange: (value: string) => void;
}

const AMPR_RECOMMENDATIONS = {
  'R1 - General': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition when updating the management plan. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R1.1 – General; Sample to qualify': 'Sample to qualify material content, otherwise treat as asbestos containing. Affix warning labels. Check condition when updating the management plan. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R1.2 – General; Confirm or Locate': 'Affix warning labels. Confirm material presence prior to working upon. Avoid mechanical damage and abrasion. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition when updating the management plan. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2 – Electrical; General': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, structural alterations, electrical upgrade, or demolition is to be carried out in this area. Check condition when updating the management plan. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2.1 – Electrical; Equipment': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, alterations or electrical upgrade are to be carried out to this equipment. Check condition when updating the management plan. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2.2 – Electrical; Dust': 'Restrict access. Affix warning label. Remove dust as soon as practicable. Avoid disturbance. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3 – General maintenance; installations': 'Affix warning labels. Avoid mechanical damage and abrasion, remove and replace during next maintenance program. Check condition when updating the management plan. Maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.1 – General maintenance; Equipment': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, alterations or upgrade are to be carried out to this equipment. Check condition when updating the management plan. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.2 – General maintenance; Gaskets': 'Affix warning labels. Treat any gasket material, other than rubber or cork, as asbestos containing unless identified otherwise by sample analysis. Avoid mechanical damage and abrasion. Check condition when updating the management plan. Remove or replace gasket material with non-asbestos alternative during programmed maintenance. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.3 – General maintenance; No access internal of plant/equipment': 'No access was gained to internals of plant/equipment. Recommend qualify equipment upon next maintenance for possible asbestos containing materials within. Check condition when updating the management plan. Recommend sample to qualify suspect materials. Treat any unknown material not sampled as asbestos containing. Avoid mechanical damage and abrasion.',
  'R3.4 – General maintenance; Sealant': 'Affix warning labels. Avoid mechanical damage and abrasion. Check condition when updating the management plan. Remove or replace sealant material with non-asbestos alternative during programmed maintenance. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R4 – Repair or replace': 'Repair or replace damaged sections as soon as practicable. Affix warning labels. Avoid mechanical damage and abrasion. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition when updating the management plan. Access to, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5 – Permit to Work': 'Restrict access. Remove as soon as practicable. In the interim, implement a Permit to Work System. Affix warning labels. Avoid damage. Check condition when updating the management plan. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5.1 – Permit to Work; Equipment': 'Restrict access. Remove as soon as practicable. In the interim, implement a Permit to Work System. Affix warning labels. Avoid damage. Remove if refurbishment, alterations or electrical upgrade are to be carried out to this equipment. Check condition when updating the management plan. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5.2 – Permit to Work; Decontaminate': 'Restrict access. Decontaminate if refurbishment, structural alteration, electrical upgrade, or demolition is to be carried out in this area. In the interim, implement a Permit to Work System. Avoid damage. Check condition when updating the management plan. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5.3 – Gutter debris': 'Restrict access. Affix warning labels. Remove debris prior to carrying out any maintenance to the gutters. Use Permit to Work System. Avoid disturbance. Check condition when updating the management plan. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.'
};

const ARRA_RECOMMENDATIONS = {
  'R1 - General': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R1.1 – General; Sample to qualify': 'Sample to qualify material content, otherwise treat as containing asbestos. Affix warning labels. Check condition annually. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R1.2 – General; Confirm or Locate': 'Affix warning labels. Confirm material presence prior to working upon. Avoid mechanical damage and abrasion. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2 – Electrical; General': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, structural alterations, electrical upgrade, or demolition is to be carried out in this area. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2.1 – Electrical; Equipment': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, alterations or electrical upgrade are to be carried out to this equipment. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R2.2 – Electrical; Dust': 'Restrict access. Affix warning label. Remove dust as soon as practicable. Avoid disturbance. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3 – General maintenance; installations': 'Affix warning labels. Avoid mechanical damage and abrasion, remove and replace during next maintenance program. Check condition annually. Maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.1 – General maintenance; Equipment': 'Affix warning labels. Avoid mechanical damage and abrasion. Remove if refurbishment, alterations or upgrade are to be carried out to this equipment. Check condition annually. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.2 – General maintenance; Gaskets': 'Affix warning labels. Treat any gasket material, other than rubber or cork, as asbestos containing unless identified otherwise by sample analysis. Avoid mechanical damage and abrasion. Check condition annually. Remove or replace gasket material with non-asbestos alternative during programmed maintenance. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R3.3 – General maintenance; No access internal of plant/equipment': 'No access was gained to internals of plant/equipment. Recommend qualify equipment upon next maintenance for possible asbestos containing materials within. Recommend sample to qualify suspect materials. Treat any unknown material not sampled as asbestos containing. Avoid mechanical damage and abrasion.',
  'R3.4 – No access- Possible': 'Affix warning labels. Sample to qualify material content, otherwise treat as asbestos containing. Check condition annually. Remove materials if refurbishment, structural alterations or demolition is to be carried out in this area. Removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R4 – Repair or replace': 'Repair or replace damaged sections as soon as practicable. Affix warning labels. Avoid mechanical damage and abrasion. Remove remaining materials if refurbishment, structural alterations or demolition is to be carried out in this area. Check condition annually. Access to, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R4.1 – Restrict access and Remove': 'Restrict access. Remove as soon as practicable. In the interim, Affix warning labels. Avoid mechanical damage and abrasion. Check condition annually. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5 – Permit to Work': 'Restrict access. Remove as soon as practicable. In the interim, implement a Permit to Work System. Affix warning labels. Avoid damage. Check condition annually. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5.1 – Permit to Work; Equipment': 'Restrict access. Remove as soon as practicable. In the interim, implement a Permit to Work System. Affix warning labels. Avoid damage. Remove if refurbishment, alterations or electrical upgrade are to be carried out to this equipment. Check condition annually. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.',
  'R5.2 – Permit to Work; Decontaminate': 'Restrict access. Decontaminate if refurbishment, structural alteration, electrical upgrade, or demolition is to be carried out in this area. In the interim, implement a Permit to Work System. Avoid damage. Check condition annually. Access, maintenance and removal of this product should be undertaken in accordance with relevant Codes of Practice.'
};

const DEMOLITION_RECOMMENDATIONS = {
  'D1 – General (Demolition Ready)': 'Remove this material prior to demolition. Affix warning labels in the interim. Avoid mechanical damage or abrasion. Removal must be undertaken in accordance with relevant Codes of Practice.',
  'D1.1 – Sample to Qualify (Demolition)': 'Sample to confirm material content. If not confirmed, treat as containing asbestos. Remove prior to demolition. Affix warning labels. Removal must be undertaken in accordance with relevant Codes of Practice.',
  'D1.2 – Confirm or Locate (Demolition)': 'Confirm material presence prior to demolition works. If unable to confirm, treat as asbestos containing. Remove material prior to demolition. Affix warning labels if still present. Removal must follow the relevant Codes of Practice.',
  'D2 – Electrical Areas (Demolition)': 'Remove all suspected or confirmed asbestos materials in electrical areas prior to demolition or electrical isolation. Affix warning labels where practical. Avoid mechanical damage or abrasion.',
  'D2.1 – Electrical Equipment (Demolition)': 'Remove any asbestos-containing components in electrical equipment prior to demolition. Affix warning labels. Handle per applicable Codes of Practice.',
  'D2.2 – Asbestos Dust (Electrical Areas)': 'Restrict access. Decontaminate dust prior to demolition. Affix warning labels. Avoid disturbance. Follow all safe work procedures and relevant Codes.',
  'D3 – Maintenance-Related ACMs': 'Remove these materials prior to demolition. Affix warning labels in the interim. Where items were to be maintained, demolition triggers their full removal.',
  'D3.1 – Equipment (Demolition)': 'Remove all asbestos components of plant/equipment prior to demolition. Ensure isolation and decontamination if required.',
  'D3.2 – Gaskets (Demolition)': 'Treat any non-rubber/cork gasket as asbestos-containing unless confirmed otherwise. Remove prior to demolition as part of disassembly. Avoid abrasion.',
  'D3.3 – No Access – Equipment Internals': 'Internal ACMs may exist. Presume asbestos within plant/equipment and remove entire units or conduct internal inspection prior to demolition. Sample where safe.',
  'D3.4 – Sealants (Demolition)': 'Remove sealants and adhesives suspected of containing asbestos prior to demolition. Treat as ACM unless sampled.',
  'D4 – Damaged Materials': 'Remove all damaged ACMs prior to demolition. Affix warning labels if still present. Avoid contact. Ensure removal is prioritised due to increased fibre release potential.',
  'D5 – Permit to Work Zones': 'These areas must be cleared prior to demolition. Until then, restrict access and implement a Permit to Work system. Removal must comply with SafeWork SA regulations.',
  'D5.1 – Permit Zones (Equipment)': 'Restrict access to equipment with ACMs. Remove ACMs from equipment prior to demolition. Permit to Work protocols must be followed if access is necessary before demolition.',
  'D5.2 – Decontamination Zones': 'Restrict access. Decontaminate all dust and debris prior to demolition. Implement control plans and removal as per Codes of Practice.',
  'D5.3 – Gutter Debris (Demolition)': 'Remove asbestos debris from gutters and downpipes prior to demolition. Permit to Work and PPE protocols apply if access is required pre-removal.',
  'D6 – Restrict Access; Remove Immediately (Demolition)': 'Restrict access immediately. Remove ACMs as soon as possible and before demolition begins. Comply with all relevant legislation and codes.',
  'D7 – Confirm Removal / Update Records': 'Update the register to reflect completed removal prior to demolition: "Item Removed (Month) (Year) by (Contractor), SafeWork SA approval (Number)".',
  'D7.1 – Confirm or Locate / Remove': 'If removal is unconfirmed, locate or treat as ACM. Remove prior to demolition. Update records accordingly.'
};

export function RecommendationSelect({ documentType, value, onValueChange }: RecommendationSelectProps) {
  const getRecommendations = () => {
    if (documentType === 'HSMR') {
      return DEMOLITION_RECOMMENDATIONS;
    } else if (documentType === 'ARRA' || documentType === 'ARRAU') {
      return ARRA_RECOMMENDATIONS;
    } else {
      return AMPR_RECOMMENDATIONS;
    }
  };

  const recommendations = getRecommendations();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select recommendation" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {Object.entries(recommendations).map(([code, description]) => (
          <SelectItem key={code} value={description} className="text-left">
            <div className="w-full">
              <div className="font-medium text-sm">{code}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {description.substring(0, 100)}...
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}