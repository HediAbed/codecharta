/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.*;
import de.maibornwolff.codecharta.model.Project;

import java.util.List;

import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SonarImporterTest {

    private final String name="ExampleName";
    private final List<String> metrics = Arrays.asList("MetricOne", "MetricTwo", "MetricThree");

    private SonarMetricsAPIDatasource metricsDS;

    private SonarMeasuresAPIDatasource measuresDS;

    private SonarImporter sonar;

    @Test
    public void shouldGetProjectWithGivenComponents(){
        //given
        Measures measures= new Measures();
        List<Measure> measureList = new ArrayList<>();
        Component component = new Component("id", "key", "name", "path", "language", Qualifier.FIL, measureList);
        measures.getComponents().add(component);
        metricsDS= mock(SonarMetricsAPIDatasource.class);
        measuresDS= mock(SonarMeasuresAPIDatasource.class);

        try {

            when(measuresDS.getNumberOfPages(metrics)).thenReturn(1);
            when(measuresDS.getMeasures(metrics,1)).thenReturn(measures);
            sonar = new SonarImporter( metricsDS, measuresDS);
            // when
            Project project = sonar.getProjectFromMeasureAPI(name, metrics);
            // then

            assertThat(project.getRootNode().getChildren(),hasSize(1));

        } catch (SonarImporterException e) {
            fail(e.getMessage());
        }

    }

    @Test
    public void shouldRejectComponentsWithoutProperQualifier(){
        //given
        Measures measures= new Measures();
        List<Measure> measureList = new ArrayList<>();
        Component component = new Component("id", "key", "name", "path", "language", Qualifier.DIR, measureList);
        measures.getComponents().add(component);
        measuresDS= mock(SonarMeasuresAPIDatasource.class);
        try {
            when(measuresDS.getNumberOfPages(metrics)).thenReturn(1);
            when(measuresDS.getMeasures(metrics,1)).thenReturn(measures);
            sonar = new SonarImporter( metricsDS, measuresDS);
            //when
            Project project = sonar.getProjectFromMeasureAPI(name, metrics);
            //then
            assertThat(project.getRootNode().getChildren(),hasSize(0));
        } catch (SonarImporterException e) {
            fail(e.getMessage());
        }

    }

    @Test
    public void shouldReturnEmptyProjectWhenNoMeasuresGiven(){
        //given
        Measures measures= new Measures();
        List<Measure> measureList = new ArrayList<>();
        measuresDS= mock(SonarMeasuresAPIDatasource.class);
        try {
            when(measuresDS.getNumberOfPages(metrics)).thenReturn(1);
            when(measuresDS.getMeasures(metrics,1)).thenReturn(measures);
            sonar = new SonarImporter( metricsDS, measuresDS);
            //when
            Project project = sonar.getProjectFromMeasureAPI(name, metrics);
            //then
            assertThat(project.getRootNode().getChildren(),hasSize(0));
        } catch (SonarImporterException e) {
            fail(e.getMessage());
        }

    }


    @Test
    public void shouldGetMetricsWhenMetricsGiven(){
        metricsDS= mock(SonarMetricsAPIDatasource.class);
        measuresDS= mock(SonarMeasuresAPIDatasource.class);
        sonar = new SonarImporter( metricsDS, measuresDS);
        assertThat(sonar.getMetricList(metrics),hasSize(3));
    }

    @Test
    public void shouldReturnStandardMetricsWhenNoMetricGiven(){
        List<String> emptyMetrics= new ArrayList<>();
        metricsDS= mock(SonarMetricsAPIDatasource.class);
        measuresDS= mock(SonarMeasuresAPIDatasource.class);
        List<MetricObject> metric= new ArrayList<>();
        MetricObject metricObject= new MetricObject(1,"key1", "INT","name","description",
                "domain",0,true, true,true);
            metric.add(metricObject);
        when(metricsDS.getAvailableMetrics()).thenReturn(metric);
        sonar = new SonarImporter( metricsDS, measuresDS);
        assertThat(sonar.getMetricList(emptyMetrics),hasSize(1));
        assertEquals(sonar.getMetricList(emptyMetrics).get(0), "key1");
    }

}
