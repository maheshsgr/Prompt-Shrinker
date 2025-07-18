import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { SchemaAnalysis, SchemaField, ValueAnalysis } from '../utils/jsonAnalyzer';
import { 
  ChevronDown, 
  ChevronRight, 
  Hash, 
  Type, 
  Calendar,
  Mail,
  Link,
  FileText,
  ToggleLeft,
  List,
  Package
} from 'lucide-react';

interface SchemaViewerProps {
  schema: SchemaAnalysis;
  title?: string;
  className?: string;
}

interface FieldViewProps {
  field: SchemaField;
}

const getTypeIcon = (type: ValueAnalysis['type']) => {
  switch (type) {
    case 'number': return <Hash className="h-4 w-4" />;
    case 'string': return <Type className="h-4 w-4" />;
    case 'boolean': return <ToggleLeft className="h-4 w-4" />;
    case 'array': return <List className="h-4 w-4" />;
    case 'object': return <Package className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getPatternIcon = (pattern: string) => {
  switch (pattern) {
    case 'date': return <Calendar className="h-3 w-3" />;
    case 'email': return <Mail className="h-3 w-3" />;
    case 'url': return <Link className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

const FieldView: React.FC<FieldViewProps> = ({ field }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { analysis } = field;

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTypeIcon(analysis.type)}
          <span className="font-medium">{field.name}</span>
          <Badge variant={field.isRequired ? "default" : "secondary"}>
            {field.isRequired ? 'Required' : `${(field.frequency * 100).toFixed(0)}%`}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {analysis.type}
          </Badge>
        </div>
        
        {(analysis.uniqueCount > 3 || analysis.range || analysis.commonPatterns) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {analysis.type === 'number' && analysis.range && (
          <div className="flex items-center gap-2">
            <span>Range: {analysis.range.min} to {analysis.range.max}</span>
          </div>
        )}
        
        {analysis.uniqueCount <= 20 && analysis.uniqueValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs">Possible values:</span>
            {analysis.uniqueValues.slice(0, isExpanded ? undefined : 3).map((value, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {JSON.stringify(value)}
              </Badge>
            ))}
            {!isExpanded && analysis.uniqueValues.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{analysis.uniqueValues.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {analysis.commonPatterns && analysis.commonPatterns.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs">Patterns:</span>
            {analysis.commonPatterns.map((pattern, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                {getPatternIcon(pattern)}
                {pattern}
              </Badge>
            ))}
          </div>
        )}

        {analysis.uniqueCount > 20 && (
          <div className="text-xs text-muted-foreground mt-1">
            {analysis.uniqueCount} unique values • Examples: {analysis.examples.map(v => JSON.stringify(v)).join(', ')}
          </div>
        )}
      </div>

      {isExpanded && analysis.uniqueCount > 3 && analysis.uniqueCount <= 20 && (
        <Collapsible open={isExpanded}>
          <CollapsibleContent className="space-y-1">
            <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
              All possible values:
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.uniqueValues.map((value, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {JSON.stringify(value)}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ 
  schema, 
  title = "Schema Analysis", 
  className = "" 
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['required']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (schema.type === 'primitive' && schema.primitiveAnalysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(schema.primitiveAnalysis.type)}
            {title}
          </CardTitle>
          <CardDescription>
            Single {schema.primitiveAnalysis.type} value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldView field={{
            name: 'value',
            analysis: schema.primitiveAnalysis,
            isRequired: true,
            frequency: 1
          }} />
        </CardContent>
      </Card>
    );
  }

  if (schema.type === 'array') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Array with {schema.samples} sample{schema.samples !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schema.arrayItemSchema && (
            <div>
              <h4 className="font-medium mb-2">Array Item Schema:</h4>
              <SchemaViewer 
                schema={schema.arrayItemSchema} 
                title="Item Structure"
                className="border-l-2 border-muted pl-4"
              />
            </div>
          )}
          
          {schema.primitiveAnalysis && (
            <div>
              <h4 className="font-medium mb-2">Array Item Analysis:</h4>
              <FieldView field={{
                name: 'items',
                analysis: schema.primitiveAnalysis,
                isRequired: true,
                frequency: 1
              }} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (schema.type === 'object' && schema.fields) {
    const requiredFields = schema.fields.filter(f => f.isRequired);
    const optionalFields = schema.fields.filter(f => !f.isRequired);

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Object with {schema.fields.length} fields • {schema.samples} sample{schema.samples !== 1 ? 's' : ''} analyzed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredFields.length > 0 && (
            <div>
              <Collapsible 
                open={expandedSections.has('required')} 
                onOpenChange={() => toggleSection('required')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <h4 className="font-medium text-left">
                      Required Fields ({requiredFields.length})
                    </h4>
                    {expandedSections.has('required') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {requiredFields.map((field, idx) => (
                    <FieldView key={idx} field={field} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {optionalFields.length > 0 && (
            <div>
              <Collapsible 
                open={expandedSections.has('optional')} 
                onOpenChange={() => toggleSection('optional')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <h4 className="font-medium text-left">
                      Optional Fields ({optionalFields.length})
                    </h4>
                    {expandedSections.has('optional') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {optionalFields.map((field, idx) => (
                    <FieldView key={idx} field={field} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>No schema information available</CardDescription>
      </CardHeader>
    </Card>
  );
};