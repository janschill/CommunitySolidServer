import { Readable } from 'stream';
import rdfSerializer from 'rdf-serialize';
import { Representation } from '../../ldp/representation/Representation';
import { RepresentationMetadata } from '../../ldp/representation/RepresentationMetadata';
import { RepresentationPreferences } from '../../ldp/representation/RepresentationPreferences';
import { CONTENT_TYPE_QUADS, DATA_TYPE_BINARY } from '../../util/ContentTypes';
import { checkRequest, matchingTypes } from './ConversionUtil';
import { RepresentationConverterArgs } from './RepresentationConverter';
import { TypedRepresentationConverter } from './TypedRepresentationConverter';

/**
 * Converts `internal/quads` to most major RDF serializations.
 */
export class QuadToRdfConverter extends TypedRepresentationConverter {
  public async getInputTypes(): Promise<{ [contentType: string]: number }> {
    return { [CONTENT_TYPE_QUADS]: 1 };
  }

  public async getOutputTypes(): Promise<{ [contentType: string]: number }> {
    return rdfSerializer.getContentTypesPrioritized();
  }

  public async canHandle(input: RepresentationConverterArgs): Promise<void> {
    checkRequest(input, [ CONTENT_TYPE_QUADS ], await rdfSerializer.getContentTypes());
  }

  public async handle(input: RepresentationConverterArgs): Promise<Representation> {
    return this.quadsToRdf(input.representation, input.preferences);
  }

  private async quadsToRdf(quads: Representation, preferences: RepresentationPreferences): Promise<Representation> {
    const contentType = matchingTypes(preferences, await rdfSerializer.getContentTypes())[0].value;
    const metadata: RepresentationMetadata = { ...quads.metadata, contentType };
    return {
      dataType: DATA_TYPE_BINARY,
      data: rdfSerializer.serialize(quads.data, { contentType }) as Readable,
      metadata,
    };
  }
}