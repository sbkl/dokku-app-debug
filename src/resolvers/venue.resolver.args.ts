import { ArgsType, Field, ID } from "type-graphql";

@ArgsType()
export class VenueUpdatedArgs {
  @Field(() => ID!)
  venueId: string;
}
